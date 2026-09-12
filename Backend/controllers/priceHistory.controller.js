const priceHistoryModel = require("../models/priceHistory.model");
const productsModel = require("../models/products.model");

async function getAllPriceHistory(req, res) {
    const { product_id, market_name, from_date, to_date, limit, offset } = req.query;
    const data = await priceHistoryModel.getAll({ product_id, market_name, from_date, to_date, limit, offset });
    if (data !== false) {
        return res.send({ error: false, data, message: "Price history records retrieved successfully" });
    }
    return res.status(500).send({ error: true, message: "Failed to retrieve price history" });
}

async function getPriceHistoryById(req, res) {
    const data = await priceHistoryModel.getById(req.params.id);
    if (data) {
        return res.send({ error: false, data, message: "Price history record retrieved successfully" });
    }
    return res.status(404).send({ error: true, message: "Price history record not found" });
}

async function getPriceHistoryByProduct(req, res) {
    const data = await priceHistoryModel.getByProductId(req.params.product_id);
    if (data !== false) {
        return res.send({ error: false, data, message: "Product price history retrieved successfully" });
    }
    return res.status(500).send({ error: true, message: "Failed to retrieve product price history" });
}

async function createPriceHistory(req, res) {
    const { product_id, market_name, location, price_per_unit, unit, recorded_date } = req.body;

    if (!product_id || !market_name || !location || !price_per_unit || !unit || !recorded_date) {
        return res.status(400).send({
            error: true,
            message: "Validation Error: product_id, market_name, location, price_per_unit, unit, and recorded_date are required"
        });
    }

    const product = await productsModel.getById(product_id);
    if (!product) {
        return res.status(404).send({ error: true, message: "Product not found" });
    }

    const result = await priceHistoryModel.insert({ product_id, market_name, location, price_per_unit, unit, recorded_date });
    if (result && result.insertId) {
        return res.status(201).send({
            error: false,
            data: { price_id: result.insertId, product_id, market_name, location, price_per_unit, unit, recorded_date },
            message: "Price history record created successfully"
        });
    }
    return res.status(500).send({ error: true, message: "Failed to create price history record" });
}

async function updatePriceHistory(req, res) {
    const data = await priceHistoryModel.update(req.params.id, req.body);
    if (data && data.affectedRows > 0) {
        return res.send({ error: false, message: "Price history record updated successfully" });
    }
    return res.status(400).send({ error: true, message: "Failed to update price history record" });
}

async function deletePriceHistory(req, res) {
    const data = await priceHistoryModel.deleteById(req.params.id);
    if (data && data.affectedRows > 0) {
        return res.send({ error: false, message: "Price history record deleted successfully" });
    }
    return res.status(400).send({ error: true, message: "Failed to delete price history record" });
}

module.exports = { getAllPriceHistory, getPriceHistoryById, getPriceHistoryByProduct, createPriceHistory, updatePriceHistory, deletePriceHistory };
