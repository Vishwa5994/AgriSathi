const db = require("../config/db");

async function getAll() {
    try {
        const [data] = await db.query("SELECT * FROM products ORDER BY product_id DESC");
        return data;
    } catch (err) {
        console.error("products.model getAll error:", err);
        return false;
    }
}

async function getById(id) {
    try {
        const [data] = await db.query("SELECT * FROM products WHERE product_id = ?", [id]);
        return data[0] || null;
    } catch (err) {
        console.error("products.model getById error:", err);
        return false;
    }
}

async function insert(productData) {
    try {
        const { product_name, category, unit, picture, description } = productData;
        let product_id = productData.product_id;
        if (!product_id) {
            const [maxRes] = await db.query("SELECT COALESCE(MAX(product_id), 0) + 1 AS nextId FROM products");
            product_id = maxRes[0].nextId;
        }
        const [result] = await db.query(
            "INSERT INTO products (product_id, product_name, category, unit, picture, description) VALUES (?, ?, ?, ?, ?, ?)",
            [product_id, product_name, category, unit, picture || null, description || null]
        );
        if (!result.insertId) {
            result.insertId = product_id;
        }
        return result;
    } catch (err) {
        console.error("products.model insert error:", err);
        return false;
    }
}

async function update(id, productData) {
    try {
        const { product_name, category, unit, picture, description } = productData;
        const [result] = await db.query(
            "UPDATE products SET product_name = ?, category = ?, unit = ?, picture = ?, description = ? WHERE product_id = ?",
            [product_name, category, unit, picture || null, description || null, id]
        );
        return result;
    } catch (err) {
        console.error("products.model update error:", err);
        return false;
    }
}

async function deleteById(id) {
    try {
        const [result] = await db.query("DELETE FROM products WHERE product_id = ?", [id]);
        return result;
    } catch (err) {
        console.error("products.model deleteById error:", err);
        return false;
    }
}

module.exports = { getAll, getById, insert, update, deleteById };
