const db = require("../config/db");

async function getAll() {
    try {
        const [data] = await db.query("SELECT user_id, name, email, phone, picture, role, created_at FROM users");
        return data;
    } catch (err) {
        console.error("users.model getAll error:", err);
        return false;
    }
}

async function getById(id) {
    try {
        const [data] = await db.query("SELECT user_id, name, email, phone, picture, role, created_at FROM users WHERE user_id = ?", [id]);
        return data[0] || null;
    } catch (err) {
        console.error("users.model getById error:", err);
        return false;
    }
}

async function getByEmail(email) {
    try {
        const [data] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        return data[0] || null;
    } catch (err) {
        console.error("users.model getByEmail error:", err);
        return false;
    }
}

async function insert(userData, client = db) {
    try {
        const { name, email, password, picture, role } = userData;
        const phoneVal = userData.phone ? (Number(String(userData.phone).replace(/[^0-9]/g, '')) || null) : null;

        let user_id = userData.user_id;
        if (!user_id) {
            const [maxRes] = await client.query("SELECT COALESCE(MAX(user_id), 0) + 1 AS nextId FROM users");
            user_id = maxRes[0].nextId;
        }

        const [result] = await client.query(
            "INSERT INTO users (user_id, name, email, phone, password, picture, role) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [user_id, name, email, phoneVal, password, picture || null, role]
        );
        if (!result.insertId) {
            result.insertId = user_id;
        }
        return result;
    } catch (err) {
        console.error("users.model insert error:", err);
        throw err;
    }
}

async function update(id, userData) {
    try {
        const fields = [];
        const params = [];

        if (userData.name !== undefined) {
            fields.push("name = ?");
            params.push(userData.name);
        }
        if (userData.phone !== undefined) {
            const cleanPhone = userData.phone ? (Number(String(userData.phone).replace(/[^0-9]/g, '')) || null) : null;
            fields.push("phone = ?");
            params.push(cleanPhone);
        }
        if (userData.picture !== undefined) {
            fields.push("picture = ?");
            params.push(userData.picture || null);
        }
        if (userData.role !== undefined) {
            fields.push("role = ?");
            params.push(userData.role);
        }

        if (fields.length === 0) {
            return { affectedRows: 0 };
        }

        params.push(id);
        const [result] = await db.query(
            `UPDATE users SET ${fields.join(", ")} WHERE user_id = ?`,
            params
        );
        return result;
    } catch (err) {
        console.error("users.model update error:", err);
        return false;
    }
}

async function safeExec(connection, sql, params) {
    try {
        await connection.query(sql, params);
    } catch (err) {
        if (err.errno !== 1146) {
            console.warn("Child cleanup warning:", err.message);
        }
    }
}

async function deleteById(id) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Delete buyer_offers
        await safeExec(connection, `
            DELETE FROM buyer_offers WHERE buyer_id = ? 
            OR listing_id IN (SELECT listing_id FROM listings WHERE farmer_id = ?)
        `, [id, id]);

        // 2. Delete reviews
        await safeExec(connection, `
            DELETE FROM reviews WHERE reviewer_id = ? OR reviewee_id = ?
            OR order_id IN (
                SELECT o.order_id FROM orders o 
                JOIN listings l ON o.listing_id = l.listing_id 
                WHERE o.buyer_id = ? OR l.farmer_id = ?
            )
        `, [id, id, id, id]);

        // 3. Delete payments
        await safeExec(connection, `
            DELETE FROM payments WHERE order_id IN (
                SELECT o.order_id FROM orders o 
                JOIN listings l ON o.listing_id = l.listing_id 
                WHERE o.buyer_id = ? OR l.farmer_id = ?
            )
        `, [id, id]);

        // 4. Delete delivery, delivery_logistics, deliveries
        const orderSubquery = `
            SELECT o.order_id FROM orders o 
            JOIN listings l ON o.listing_id = l.listing_id 
            WHERE o.buyer_id = ? OR l.farmer_id = ?
        `;
        await safeExec(connection, `DELETE FROM delivery WHERE order_id IN (${orderSubquery})`, [id, id]);
        await safeExec(connection, `DELETE FROM delivery_logistics WHERE order_id IN (${orderSubquery})`, [id, id]);
        await safeExec(connection, `DELETE FROM deliveries WHERE order_id IN (${orderSubquery})`, [id, id]);

        // 5. Delete orders
        await safeExec(connection, `
            DELETE FROM orders WHERE buyer_id = ? 
            OR listing_id IN (SELECT listing_id FROM listings WHERE farmer_id = ?)
        `, [id, id]);

        // 6. Delete listings & profiles
        await safeExec(connection, "DELETE FROM listings WHERE farmer_id = ?", [id]);
        await safeExec(connection, "DELETE FROM farmer_profiles WHERE farmer_id = ?", [id]);
        await safeExec(connection, "DELETE FROM buyer_profiles WHERE buyer_id = ?", [id]);
        await safeExec(connection, "DELETE FROM notifications WHERE user_id = ?", [id]);

        // 7. Delete user record
        const [result] = await connection.query("DELETE FROM users WHERE user_id = ?", [id]);

        await connection.commit();
        return result;
    } catch (err) {
        await connection.rollback();
        console.error("users.model deleteById error:", err);
        return false;
    } finally {
        connection.release();
    }
}

module.exports = { getAll, getById, getByEmail, insert, update, deleteById };
