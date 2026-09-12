const db = require("../config/db");

async function getAll(filters = {}) {
    try {
        let query = `
            SELECT ph.*, p.product_name, p.category 
            FROM price_history ph
            JOIN products p ON ph.product_id = p.product_id
            WHERE 1=1
        `;
        const params = [];

        if (filters.product_id) {
            query += " AND ph.product_id = ?";
            params.push(filters.product_id);
        }
        if (filters.market_name) {
            query += " AND ph.market_name LIKE ?";
            params.push(`%${filters.market_name}%`);
        }
        if (filters.from_date) {
            query += " AND ph.recorded_date >= ?";
            params.push(filters.from_date);
        }
        if (filters.to_date) {
            query += " AND ph.recorded_date <= ?";
            params.push(filters.to_date);
        }

        query += " ORDER BY ph.recorded_date DESC, ph.price_id DESC";

        const limit = Number(filters.limit) || 50;
        const offset = Number(filters.offset) || 0;
        query += " LIMIT ? OFFSET ?";
        params.push(limit, offset);

        const [data] = await db.query(query, params);
        return data;
    } catch (err) {
        console.error("priceHistory.model getAll error:", err);
        return false;
    }
}

async function getById(id) {
    try {
        const [data] = await db.query(`
            SELECT ph.*, p.product_name, p.category 
            FROM price_history ph
            JOIN products p ON ph.product_id = p.product_id
            WHERE ph.price_id = ?
        `, [id]);
        return data[0] || null;
    } catch (err) {
        console.error("priceHistory.model getById error:", err);
        return false;
    }
}

async function getByProductId(productId) {
    try {
        const [data] = await db.query(`
            SELECT ph.*, p.product_name, p.category 
            FROM price_history ph
            JOIN products p ON ph.product_id = p.product_id
            WHERE ph.product_id = ?
            ORDER BY ph.recorded_date DESC
        `, [productId]);
        return data;
    } catch (err) {
        console.error("priceHistory.model getByProductId error:", err);
        return false;
    }
}

async function insert(priceData) {
    try {
        const { product_id, market_name, location, price_per_unit, unit, recorded_date } = priceData;
        const [result] = await db.query(
            "INSERT INTO price_history (product_id, market_name, location, price_per_unit, unit, recorded_date) VALUES (?, ?, ?, ?, ?, ?)",
            [product_id, market_name, location, price_per_unit, unit, recorded_date]
        );
        return result;
    } catch (err) {
        console.error("priceHistory.model insert error:", err);
        return false;
    }
}

async function update(id, priceData) {
    try {
        const { product_id, market_name, location, price_per_unit, unit, recorded_date } = priceData;
        const [result] = await db.query(
            "UPDATE price_history SET product_id = ?, market_name = ?, location = ?, price_per_unit = ?, unit = ?, recorded_date = ? WHERE price_id = ?",
            [product_id, market_name, location, price_per_unit, unit, recorded_date, id]
        );
        return result;
    } catch (err) {
        console.error("priceHistory.model update error:", err);
        return false;
    }
}

async function deleteById(id) {
    try {
        const [result] = await db.query("DELETE FROM price_history WHERE price_id = ?", [id]);
        return result;
    } catch (err) {
        console.error("priceHistory.model deleteById error:", err);
        return false;
    }
}

module.exports = { getAll, getById, getByProductId, insert, update, deleteById };
