const productsModel = require("../models/products.model");

async function getAllProducts(req, res) {
    const data = await productsModel.getAll();
    if (data !== false) {
        return res.send({ error: false, data, message: "Products retrieved successfully" });
    }
    return res.status(500).send({ error: true, message: "Failed to retrieve products" });
}

async function getProductById(req, res) {
    const data = await productsModel.getById(req.params.id);
    if (data) {
        return res.send({ error: false, data, message: "Product retrieved successfully" });
    }
    return res.status(404).send({ error: true, message: "Product not found" });
}

async function createProduct(req, res) {
    const { product_name, category, unit, picture, description } = req.body;
    if (!product_name || !category || !unit) {
        return res.status(400).send({ error: true, message: "Validation Error: product_name, category, and unit are required" });
    }

    const result = await productsModel.insert({ product_name, category, unit, picture, description });
    if (result && result.insertId) {
        return res.status(201).send({ error: false, data: { product_id: result.insertId, product_name, category, unit }, message: "Product created successfully" });
    }
    return res.status(500).send({ error: true, message: "Failed to create product" });
}

async function updateProduct(req, res) {
    const data = await productsModel.update(req.params.id, req.body);
    if (data && data.affectedRows > 0) {
        return res.send({ error: false, message: "Product updated successfully" });
    }
    return res.status(400).send({ error: true, message: "Failed to update product" });
}

async function deleteProduct(req, res) {
    const data = await productsModel.deleteById(req.params.id);
    if (data && data.affectedRows > 0) {
        return res.send({ error: false, message: "Product deleted successfully" });
    }
    return res.status(400).send({ error: true, message: "Failed to delete product" });
}

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };
