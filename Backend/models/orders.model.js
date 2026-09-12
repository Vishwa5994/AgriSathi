const db = require("../config/db");

async function getAll(filters = {}) {
    try {
        let query = `
            SELECT o.*, l.farmer_id, l.product_id, p.product_name, 
                   u_buyer.name as buyer_name, u_buyer.phone as buyer_phone,
                   u_farmer.name as farmer_name, u_farmer.phone as farmer_phone
            FROM orders o
            JOIN listings l ON o.listing_id = l.listing_id
            JOIN products p ON l.product_id = p.product_id
            JOIN users u_buyer ON o.buyer_id = u_buyer.user_id
            JOIN users u_farmer ON l.farmer_id = u_farmer.user_id
            WHERE 1=1
        `;
        const params = [];

        if (filters.buyer_id) {
            query += " AND o.buyer_id = ?";
            params.push(filters.buyer_id);
        }
        if (filters.farmer_id) {
            query += " AND l.farmer_id = ?";
            params.push(filters.farmer_id);
        }
        if (filters.status) {
            query += " AND o.status = ?";
            params.push(filters.status);
        }

        query += " ORDER BY o.order_id DESC";

        const limit = Number(filters.limit) || 50;
        const offset = Number(filters.offset) || 0;
        query += " LIMIT ? OFFSET ?";
        params.push(limit, offset);

        const [data] = await db.query(query, params);
        return data;
    } catch (err) {
        console.error("orders.model getAll error:", err);
        return false;
    }
}

async function getById(id) {
    try {
        const [data] = await db.query(`
            SELECT o.*, l.farmer_id, l.product_id, p.product_name, 
                   u_buyer.name as buyer_name, u_buyer.phone as buyer_phone,
                   u_farmer.name as farmer_name, u_farmer.phone as farmer_phone
            FROM orders o
            JOIN listings l ON o.listing_id = l.listing_id
            JOIN products p ON l.product_id = p.product_id
            JOIN users u_buyer ON o.buyer_id = u_buyer.user_id
            JOIN users u_farmer ON l.farmer_id = u_farmer.user_id
            WHERE o.order_id = ?
        `, [id]);
        return data[0] || null;
    } catch (err) {
        console.error("orders.model getById error:", err);
        return false;
    }
}

async function getByBuyerId(buyerId) {
    try {
        const [data] = await db.query(`
            SELECT o.*, p.product_name, u_farmer.name as farmer_name
            FROM orders o
            JOIN listings l ON o.listing_id = l.listing_id
            JOIN products p ON l.product_id = p.product_id
            JOIN users u_farmer ON l.farmer_id = u_farmer.user_id
            WHERE o.buyer_id = ?
            ORDER BY o.order_id DESC
        `, [buyerId]);
        return data;
    } catch (err) {
        console.error("orders.model getByBuyerId error:", err);
        return false;
    }
}

async function getByListingId(listingId) {
    try {
        const [data] = await db.query("SELECT * FROM orders WHERE listing_id = ? ORDER BY order_id DESC", [listingId]);
        return data;
    } catch (err) {
        console.error("orders.model getByListingId error:", err);
        return false;
    }
}

async function insert(orderData, client = db) {
    try {
        const { listing_id, buyer_id, quantity, price_per_unit, total_amount, status } = orderData;
        let order_id = orderData.order_id;
        if (!order_id) {
            const [maxRes] = await client.query("SELECT COALESCE(MAX(order_id), 0) + 1 AS nextId FROM orders");
            order_id = maxRes[0].nextId;
        }
        const [result] = await client.query(
            "INSERT INTO orders (order_id, listing_id, buyer_id, quantity, price_per_unit, total_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [order_id, listing_id, buyer_id, quantity, price_per_unit, total_amount, status || 'PENDING']
        );
        if (!result.insertId) {
            result.insertId = order_id;
        }
        return result;
    } catch (err) {
        console.error("orders.model insert error:", err);
        throw err;
    }
}

async function updateStatus(id, status, client = db) {
    try {
        const [result] = await client.query(
            "UPDATE orders SET status = ? WHERE order_id = ?",
            [status, id]
        );
        return result;
    } catch (err) {
        console.error("orders.model updateStatus error:", err);
        throw err;
    }
}

async function update(id, orderData) {
    try {
        const { quantity, price_per_unit, total_amount, status } = orderData;
        const [result] = await db.query(
            "UPDATE orders SET quantity = ?, price_per_unit = ?, total_amount = ?, status = ? WHERE order_id = ?",
            [quantity, price_per_unit, total_amount, status, id]
        );
        return result;
    } catch (err) {
        console.error("orders.model update error:", err);
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

        // Delete child rows referencing this order in both delivery, delivery_logistics, payments, reviews
        await safeExec(connection, "DELETE FROM delivery WHERE order_id = ?", [id]);
        await safeExec(connection, "DELETE FROM delivery_logistics WHERE order_id = ?", [id]);
        await safeExec(connection, "DELETE FROM deliveries WHERE order_id = ?", [id]);
        await safeExec(connection, "DELETE FROM payments WHERE order_id = ?", [id]);
        await safeExec(connection, "DELETE FROM reviews WHERE order_id = ?", [id]);

        // Delete main order row
        const [result] = await connection.query("DELETE FROM orders WHERE order_id = ?", [id]);

        await connection.commit();
        return result;
    } catch (err) {
        await connection.rollback();
        console.error("orders.model deleteById error:", err);
        return false;
    } finally {
        connection.release();
    }
}

module.exports = { getAll, getById, getByBuyerId, getByListingId, insert, updateStatus, update, deleteById };
