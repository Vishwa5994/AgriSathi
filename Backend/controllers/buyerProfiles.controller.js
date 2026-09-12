const buyerProfilesModel = require("../models/buyerProfiles.model");

async function getAllProfiles(req, res) {
    const data = await buyerProfilesModel.getAll();
    if (data !== false) {
        return res.send({ error: false, data, message: "Buyer profiles retrieved successfully" });
    }
    return res.status(500).send({ error: true, message: "Failed to retrieve buyer profiles" });
}

async function getProfileById(req, res) {
    const data = await buyerProfilesModel.getByBuyerId(req.params.id);
    if (data) {
        return res.send({ error: false, data, message: "Buyer profile retrieved successfully" });
    }
    return res.status(404).send({ error: true, message: "Buyer profile not found" });
}

async function createProfile(req, res) {
    try {
        const buyer_id = req.user.role === "BUYER" ? req.user.user_id : (req.body.buyer_id || req.user.user_id);
        const { picture, business_name, buyer_type, address, city } = req.body;
        await buyerProfilesModel.insert({ buyer_id, picture, business_name, buyer_type, address, city });
        return res.status(201).send({ error: false, message: "Buyer profile created successfully" });
    } catch (err) {
        return res.status(500).send({ error: true, message: "Failed to create buyer profile" });
    }
}

async function updateProfile(req, res) {
    const targetId = Number(req.params.id);
    if (req.user.role !== "ADMIN" && req.user.user_id !== targetId) {
        return res.status(403).send({ error: true, message: "Forbidden: You can only update your own buyer profile" });
    }
    const data = await buyerProfilesModel.update(targetId, req.body);
    if (data && data.affectedRows > 0) {
        return res.send({ error: false, message: "Buyer profile updated successfully" });
    }
    return res.status(400).send({ error: true, message: "Failed to update buyer profile" });
}

async function deleteProfile(req, res) {
    const targetId = Number(req.params.id);
    if (req.user.role !== "ADMIN" && req.user.user_id !== targetId) {
        return res.status(403).send({ error: true, message: "Forbidden: You can only delete your own buyer profile" });
    }
    const data = await buyerProfilesModel.deleteById(targetId);
    if (data && data.affectedRows > 0) {
        return res.send({ error: false, message: "Buyer profile deleted successfully" });
    }
    return res.status(400).send({ error: true, message: "Failed to delete buyer profile" });
}

module.exports = { getAllProfiles, getProfileById, createProfile, updateProfile, deleteProfile };
