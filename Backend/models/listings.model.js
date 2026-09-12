const db = require("../config/db");

async function getAll(filters = {}) {
    try {
        let query = `
            SELECT l.*, l.quantity as available_stock, p.product_name, p.category, p.unit, p.picture, p.picture as image_url, p.description, u.name as farmer_name, u.phone as farmer_phone 
            FROM listings l
            JOIN products p ON l.product_id = p.product_id
            JOIN users u ON l.farmer_id = u.user_id
            WHERE 1=1
        `;
        const params = [];

        if (filters.product_id) {
            query += " AND l.product_id = ?";
            params.push(filters.product_id);
        }
        if (filters.status) {
            query += " AND l.status = ?";
            params.push(filters.status);
        }
        if (filters.location) {
            query += " AND l.location LIKE ?";
            params.push(`%${filters.location}%`);
        }

        query += " ORDER BY l.listing_id DESC";

        const limit = Number(filters.limit) || 50;
        const offset = Number(filters.offset) || 0;
        query += " LIMIT ? OFFSET ?";
        params.push(limit, offset);

        const [data] = await db.query(query, params);
        return data;
    } catch (err) {
        console.error("listings.model getAll error:", err);
        return false;
    }
}

async function getById(id) {
    try {
        const [data] = await db.query(`
            SELECT l.*, l.quantity as available_stock, p.product_name, p.category, p.unit, p.picture, p.picture as image_url, p.description, u.name as farmer_name, u.phone as farmer_phone 
            FROM listings l
            JOIN products p ON l.product_id = p.product_id
            JOIN users u ON l.farmer_id = u.user_id
            WHERE l.listing_id = ?
        `, [id]);
        return data[0] || null;
    } catch (err) {
        console.error("listings.model getById error:", err);
        return false;
    }
}

async function getByFarmerId(farmerId) {
    try {
        const [data] = await db.query(`
            SELECT l.*, l.quantity as available_stock, p.product_name, p.category, p.unit, p.picture, p.picture as image_url, p.description 
            FROM listings l
            JOIN products p ON l.product_id = p.product_id
            WHERE l.farmer_id = ?
            ORDER BY l.listing_id DESC
        `, [farmerId]);
        return data;
    } catch (err) {
        console.error("listings.model getByFarmerId error:", err);
        return false;
    }
}

async function insert(listingData) {
    try {
        const { farmer_id, product_id, quantity, price_per_unit, quality_grade, harvest_date, location, status } = listingData;
        let listing_id = listingData.listing_id;
        if (!listing_id) {
            const [maxRes] = await db.query("SELECT COALESCE(MAX(listing_id), 0) + 1 AS nextId FROM listings");
            listing_id = maxRes[0].nextId;
        }
        const [result] = await db.query(
            "INSERT INTO listings (listing_id, farmer_id, product_id, quantity, price_per_unit, quality_grade, harvest_date, location, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [listing_id, farmer_id, product_id, quantity, price_per_unit, quality_grade || null, harvest_date || null, location, status || 'AVAILABLE']
        );
        if (!result.insertId) {
            result.insertId = listing_id;
        }
        return result;
    } catch (err) {
        console.error("listings.model insert error:", err);
        return false;
    }
}

async function update(id, listingData) {
    try {
        const { quantity, price_per_unit, quality_grade, harvest_date, location, status } = listingData;
        const [result] = await db.query(
            "UPDATE listings SET quantity = ?, price_per_unit = ?, quality_grade = ?, harvest_date = ?, location = ?, status = ? WHERE listing_id = ?",
            [quantity, price_per_unit, quality_grade || null, harvest_date || null, location, status || 'AVAILABLE', id]
        );
        return result;
    } catch (err) {
        console.error("listings.model update error:", err);
        return false;
    }
}

async function updateStatus(id, status, client = db) {
    try {
        const [result] = await client.query(
            "UPDATE listings SET status = ? WHERE listing_id = ?",
            [status, id]
        );
        return result;
    } catch (err) {
        console.error("listings.model updateStatus error:", err);
        throw err;
    }
}

async function updateQuantityAndStatus(id, quantity, status, client = db) {
    try {
        const [result] = await client.query(
            "UPDATE listings SET quantity = ?, status = ? WHERE listing_id = ?",
            [quantity, status, id]
        );
        return result;
    } catch (err) {
        console.error("listings.model updateQuantityAndStatus error:", err);
        throw err;
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

        const orderSubquery = "SELECT order_id FROM orders WHERE listing_id = ?";

        await safeExec(connection, "DELETE FROM buyer_offers WHERE listing_id = ?", [id]);
        await safeExec(connection, `DELETE FROM reviews WHERE order_id IN (${orderSubquery})`, [id]);
        await safeExec(connection, `DELETE FROM payments WHERE order_id IN (${orderSubquery})`, [id]);
        await safeExec(connection, `DELETE FROM delivery WHERE order_id IN (${orderSubquery})`, [id]);
        await safeExec(connection, `DELETE FROM delivery_logistics WHERE order_id IN (${orderSubquery})`, [id]);
        await safeExec(connection, `DELETE FROM deliveries WHERE order_id IN (${orderSubquery})`, [id]);
        await safeExec(connection, "DELETE FROM orders WHERE listing_id = ?", [id]);

        const [result] = await connection.query("DELETE FROM listings WHERE listing_id = ?", [id]);

        await connection.commit();
        return result;
    } catch (err) {
        await connection.rollback();
        console.error("listings.model deleteById error:", err);
        return false;
    } finally {
        connection.release();
    }
}

module.exports = { getAll, getById, getByFarmerId, insert, update, updateStatus, updateQuantityAndStatus, deleteById };
