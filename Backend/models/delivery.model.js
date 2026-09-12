const db = require("../config/db");

// Helper function to execute query on delivery_logistics with fallback to delivery table
async function execWithFallback(queryLogistics, queryDelivery, params, client = db) {
    try {
        const [result] = await client.query(queryLogistics, params);
        return [result];
    } catch (err) {
        if (err.errno === 1146) {
            // Table delivery_logistics doesn't exist, try delivery table
            const [result] = await client.query(queryDelivery, params);
            return [result];
        }
        throw err;
    }
}

async function getAll() {
    try {
        const query1 = `
            SELECT d.*, o.listing_id, o.buyer_id 
            FROM delivery_logistics d
            JOIN orders o ON d.order_id = o.order_id
            ORDER BY d.delivery_id DESC
        `;
        const query2 = `
            SELECT d.*, o.listing_id, o.buyer_id 
            FROM delivery d
            JOIN orders o ON d.order_id = o.order_id
            ORDER BY d.delivery_id DESC
        `;
        const [data] = await execWithFallback(query1, query2, []);
        return data;
    } catch (err) {
        console.error("delivery.model getAll error:", err);
        return false;
    }
}

async function getById(id) {
    try {
        const query1 = `
            SELECT d.*, o.listing_id, o.buyer_id 
            FROM delivery_logistics d
            JOIN orders o ON d.order_id = o.order_id
            WHERE d.delivery_id = ?
        `;
        const query2 = `
            SELECT d.*, o.listing_id, o.buyer_id 
            FROM delivery d
            JOIN orders o ON d.order_id = o.order_id
            WHERE d.delivery_id = ?
        `;
        const [data] = await execWithFallback(query1, query2, [id]);
        return data[0] || null;
    } catch (err) {
        console.error("delivery.model getById error:", err);
        return false;
    }
}

async function getByOrderId(orderId) {
    try {
        const q1 = "SELECT * FROM delivery_logistics WHERE order_id = ? ORDER BY delivery_id DESC";
        const q2 = "SELECT * FROM delivery WHERE order_id = ? ORDER BY delivery_id DESC";
        const [data] = await execWithFallback(q1, q2, [orderId]);
        return data;
    } catch (err) {
        console.error("delivery.model getByOrderId error:", err);
        return false;
    }
}

async function insert(deliveryData, client = db) {
    try {
        const { order_id, pickup_location, delivery_address, delivery_status, delivery_date, transport_cost } = deliveryData;
        const params = [order_id, pickup_location, delivery_address, delivery_status || 'PENDING', delivery_date || null, transport_cost || 0];

        const q1 = "INSERT INTO delivery_logistics (order_id, pickup_location, delivery_address, delivery_status, delivery_date, transport_cost) VALUES (?, ?, ?, ?, ?, ?)";
        const q2 = "INSERT INTO delivery (order_id, pickup_location, delivery_address, delivery_status, delivery_date, transport_cost) VALUES (?, ?, ?, ?, ?, ?)";

        const [result] = await execWithFallback(q1, q2, params, client);
        return result;
    } catch (err) {
        console.error("delivery.model insert error:", err);
        throw err;
    }
}

async function update(id, deliveryData) {
    try {
        const { pickup_location, delivery_address, delivery_status, delivery_date, transport_cost } = deliveryData;
        const params = [pickup_location, delivery_address, delivery_status, delivery_date || null, transport_cost || 0, id];

        const q1 = "UPDATE delivery_logistics SET pickup_location = ?, delivery_address = ?, delivery_status = ?, delivery_date = ?, transport_cost = ? WHERE delivery_id = ?";
        const q2 = "UPDATE delivery SET pickup_location = ?, delivery_address = ?, delivery_status = ?, delivery_date = ?, transport_cost = ? WHERE delivery_id = ?";

        const [result] = await execWithFallback(q1, q2, params);
        return result;
    } catch (err) {
        console.error("delivery.model update error:", err);
        return false;
    }
}

async function updateStatus(id, delivery_status, client = db) {
    try {
        const params = [delivery_status, id];
        const q1 = "UPDATE delivery_logistics SET delivery_status = ? WHERE delivery_id = ?";
        const q2 = "UPDATE delivery SET delivery_status = ? WHERE delivery_id = ?";

        const [result] = await execWithFallback(q1, q2, params, client);
        return result;
    } catch (err) {
        console.error("delivery.model updateStatus error:", err);
        throw err;
    }
}

async function deleteById(id) {
    try {
        const q1 = "DELETE FROM delivery_logistics WHERE delivery_id = ?";
        const q2 = "DELETE FROM delivery WHERE delivery_id = ?";

        const [result] = await execWithFallback(q1, q2, [id]);
        return result;
    } catch (err) {
        console.error("delivery.model deleteById error:", err);
        return false;
    }
}

module.exports = { getAll, getById, getByOrderId, insert, update, updateStatus, deleteById };
