const db = require("../config/db");

async function getAll() {
    try {
        const [data] = await db.query(`
            SELECT p.*, o.listing_id, o.buyer_id, o.total_amount as order_total 
            FROM payments p
            JOIN orders o ON p.order_id = o.order_id
            ORDER BY p.payment_id DESC
        `);
        return data;
    } catch (err) {
        console.error("payments.model getAll error:", err);
        return false;
    }
}

async function getById(id) {
    try {
        const [data] = await db.query(`
            SELECT p.*, o.listing_id, o.buyer_id, o.total_amount as order_total 
            FROM payments p
            JOIN orders o ON p.order_id = o.order_id
            WHERE p.payment_id = ?
        `, [id]);
        return data[0] || null;
    } catch (err) {
        console.error("payments.model getById error:", err);
        return false;
    }
}

async function getByOrderId(orderId) {
    try {
        const [data] = await db.query("SELECT * FROM payments WHERE order_id = ? ORDER BY payment_id DESC", [orderId]);
        return data;
    } catch (err) {
        console.error("payments.model getByOrderId error:", err);
        return false;
    }
}

async function insert(paymentData, client = db) {
    try {
        const { order_id, amount, payment_method, payment_status, transaction_id, paid_at } = paymentData;
        const [result] = await client.query(
            "INSERT INTO payments (order_id, amount, payment_method, payment_status, transaction_id, paid_at) VALUES (?, ?, ?, ?, ?, ?)",
            [order_id, amount, payment_method, payment_status || 'PENDING', transaction_id || null, paid_at || null]
        );
        return result;
    } catch (err) {
        console.error("payments.model insert error:", err);
        throw err;
    }
}

async function update(id, paymentData) {
    try {
        const { amount, payment_method, payment_status, transaction_id, paid_at } = paymentData;
        const [result] = await db.query(
            "UPDATE payments SET amount = ?, payment_method = ?, payment_status = ?, transaction_id = ?, paid_at = ? WHERE payment_id = ?",
            [amount, payment_method, payment_status, transaction_id || null, paid_at || null, id]
        );
        return result;
    } catch (err) {
        console.error("payments.model update error:", err);
        return false;
    }
}

async function updateStatus(id, payment_status, transaction_id = null, client = db) {
    try {
        const paidAt = payment_status === 'PAID' ? new Date() : null;
        const [result] = await client.query(
            "UPDATE payments SET payment_status = ?, transaction_id = COALESCE(?, transaction_id), paid_at = ? WHERE payment_id = ?",
            [payment_status, transaction_id, paidAt, id]
        );
        return result;
    } catch (err) {
        console.error("payments.model updateStatus error:", err);
        throw err;
    }
}

async function deleteById(id) {
    try {
        const [result] = await db.query("DELETE FROM payments WHERE payment_id = ?", [id]);
        return result;
    } catch (err) {
        console.error("payments.model deleteById error:", err);
        return false;
    }
}

module.exports = { getAll, getById, getByOrderId, insert, update, updateStatus, deleteById };
