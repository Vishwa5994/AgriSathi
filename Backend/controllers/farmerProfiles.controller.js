const farmerProfilesModel = require("../models/farmerProfiles.model");

async function getAllProfiles(req, res) {
    const data = await farmerProfilesModel.getAll();
    if (data !== false) {
        return res.send({ error: false, data, message: "Farmer profiles retrieved successfully" });
    }
    return res.status(500).send({ error: true, message: "Failed to retrieve farmer profiles" });
}

async function getProfileById(req, res) {
    const data = await farmerProfilesModel.getByFarmerId(req.params.id);
    if (data) {
        return res.send({ error: false, data, message: "Farmer profile retrieved successfully" });
    }
    return res.status(404).send({ error: true, message: "Farmer profile not found" });
}

async function createProfile(req, res) {
    try {
        const farmer_id = req.user.role === "FARMER" ? req.user.user_id : (req.body.farmer_id || req.user.user_id);
        const { picture, village, district, state, land_area } = req.body;
        await farmerProfilesModel.insert({ farmer_id, picture, village, district, state, land_area });
        return res.status(201).send({ error: false, message: "Farmer profile created successfully" });
    } catch (err) {
        return res.status(500).send({ error: true, message: "Failed to create farmer profile" });
    }
}

async function updateProfile(req, res) {
    const targetId = Number(req.params.id);
    if (req.user.role !== "ADMIN" && req.user.user_id !== targetId) {
        return res.status(403).send({ error: true, message: "Forbidden: You can only update your own farmer profile" });
    }
    const data = await farmerProfilesModel.update(targetId, req.body);
    if (data && data.affectedRows > 0) {
        return res.send({ error: false, message: "Farmer profile updated successfully" });
    }
    return res.status(400).send({ error: true, message: "Failed to update farmer profile" });
}

async function deleteProfile(req, res) {
    const targetId = Number(req.params.id);
    if (req.user.role !== "ADMIN" && req.user.user_id !== targetId) {
        return res.status(403).send({ error: true, message: "Forbidden: You can only delete your own farmer profile" });
    }
    const data = await farmerProfilesModel.deleteById(targetId);
    if (data && data.affectedRows > 0) {
        return res.send({ error: false, message: "Farmer profile deleted successfully" });
    }
    return res.status(400).send({ error: true, message: "Failed to delete farmer profile" });
}

module.exports = { getAllProfiles, getProfileById, createProfile, updateProfile, deleteProfile };
