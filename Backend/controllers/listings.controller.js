const listingsModel = require("../models/listings.model");
const productsModel = require("../models/products.model");

async function getAllListings(req, res) {
    const { product_id, status, location, limit, offset } = req.query;
    const data = await listingsModel.getAll({ product_id, status, location, limit, offset });
    if (data !== false) {
        return res.send({ error: false, data, message: "Listings retrieved successfully" });
    }
    return res.status(500).send({ error: true, message: "Failed to retrieve listings" });
}

async function getListingById(req, res) {
    const data = await listingsModel.getById(req.params.id);
    if (data) {
        return res.send({ error: false, data, message: "Listing retrieved successfully" });
    }
    return res.status(404).send({ error: true, message: "Listing not found" });
}

async function getListingsByFarmer(req, res) {
    const farmerId = req.params.farmer_id || req.user.user_id;
    const data = await listingsModel.getByFarmerId(farmerId);
    if (data !== false) {
        return res.send({ error: false, data, message: "Farmer listings retrieved successfully" });
    }
    return res.status(500).send({ error: true, message: "Failed to retrieve farmer listings" });
}

async function createListing(req, res) {
    const farmer_id = req.user.role === "FARMER" ? req.user.user_id : (req.body.farmer_id || req.user.user_id);
    const { product_id, quantity, price_per_unit, quality_grade, harvest_date, location, status } = req.body;

    if (!product_id || !quantity || !price_per_unit || !location) {
        return res.status(400).send({
            error: true,
            message: "Validation Error: product_id, quantity, price_per_unit, and location are required"
        });
    }

    const product = await productsModel.getById(product_id);
    if (!product) {
        return res.status(404).send({
            error: true,
            message: "Product not found. Ensure product_id exists before creating a listing."
        });
    }

    const result = await listingsModel.insert({
        farmer_id,
        product_id,
        quantity,
        price_per_unit,
        quality_grade,
        harvest_date,
        location,
        status: status || 'AVAILABLE'
    });

    if (result && result.insertId) {
        return res.status(201).send({
            error: false,
            data: { listing_id: result.insertId, farmer_id, product_id, quantity, price_per_unit, location, status: status || 'AVAILABLE' },
            message: "Listing created successfully"
        });
    }

    return res.status(500).send({ error: true, message: "Failed to create listing" });
}

async function updateListing(req, res) {
    const listing = await listingsModel.getById(req.params.id);
    if (!listing) {
        return res.status(404).send({ error: true, message: "Listing not found" });
    }

    if (req.user.role === "FARMER" && listing.farmer_id !== req.user.user_id) {
        return res.status(403).send({ error: true, message: "Forbidden: You can only update your own listings" });
    }

    const data = await listingsModel.update(req.params.id, {
        quantity: req.body.quantity !== undefined ? req.body.quantity : listing.quantity,
        price_per_unit: req.body.price_per_unit !== undefined ? req.body.price_per_unit : listing.price_per_unit,
        quality_grade: req.body.quality_grade !== undefined ? req.body.quality_grade : listing.quality_grade,
        harvest_date: req.body.harvest_date !== undefined ? req.body.harvest_date : listing.harvest_date,
        location: req.body.location !== undefined ? req.body.location : listing.location,
        status: req.body.status !== undefined ? req.body.status : listing.status
    });

    if (data && data.affectedRows > 0) {
        return res.send({ error: false, message: "Listing updated successfully" });
    }
    return res.status(400).send({ error: true, message: "Failed to update listing" });
}

async function deleteListing(req, res) {
    const listing = await listingsModel.getById(req.params.id);
    if (!listing) {
        return res.status(404).send({ error: true, message: "Listing not found" });
    }

    if (req.user.role === "FARMER" && listing.farmer_id !== req.user.user_id) {
        return res.status(403).send({ error: true, message: "Forbidden: You can only delete your own listings" });
    }

    const data = await listingsModel.deleteById(req.params.id);
    if (data && data.affectedRows > 0) {
        return res.send({ error: false, message: "Listing deleted successfully" });
    }
    return res.status(400).send({ error: true, message: "Failed to delete listing" });
}

module.exports = { getAllListings, getListingById, getListingsByFarmer, createListing, updateListing, deleteListing };
