const usersModel = require("../models/users.model");

async function getAllUsers(req, res) {
    const data = await usersModel.getAll();
    if (data !== false) {
        return res.send({ error: false, data, message: "Users retrieved successfully" });
    }
    return res.status(500).send({ error: true, message: "Failed to retrieve users" });
}

async function getUserById(req, res) {
    const data = await usersModel.getById(req.params.id);
    if (data) {
        return res.send({ error: false, data, message: "User retrieved successfully" });
    }
    return res.status(404).send({ error: true, message: "User not found" });
}

const farmerProfilesModel = require("../models/farmerProfiles.model");
const buyerProfilesModel = require("../models/buyerProfiles.model");
const jwt = require("jsonwebtoken");

async function updateUser(req, res) {
    const targetId = Number(req.params.id);
    const authUserId = req.user.user_id || req.user.id;
    if (req.user.role !== "ADMIN" && authUserId !== targetId) {
        return res.status(403).send({ error: true, message: "Forbidden: You can only update your own user account" });
    }
    const data = await usersModel.update(targetId, req.body);
    if (data && data.affectedRows > 0) {
        const updatedUser = await usersModel.getById(targetId);

        // Ensure profile record exists if role is set
        if (req.body.role === "FARMER" || updatedUser?.role === "FARMER") {
            const fp = await farmerProfilesModel.getByFarmerId(targetId);
            if (!fp) {
                try {
                    await farmerProfilesModel.insert({
                        farmer_id: targetId,
                        picture: updatedUser?.picture || null,
                        village: req.body.village || "Pimpalgaon",
                        district: req.body.district || "Nashik",
                        state: req.body.state || "Maharashtra",
                        land_area: req.body.land_area || 0
                    });
                } catch (e) {
                    console.warn("Could not auto-create farmer profile:", e.message);
                }
            }
        } else if (req.body.role === "BUYER" || updatedUser?.role === "BUYER") {
            const bp = await buyerProfilesModel.getByBuyerId(targetId);
            if (!bp) {
                try {
                    await buyerProfilesModel.insert({
                        buyer_id: targetId,
                        picture: updatedUser?.picture || null,
                        business_name: req.body.business_name || `${updatedUser?.name || 'Buyer'} Enterprise`,
                        buyer_type: req.body.buyer_type || "CONSUMER",
                        address: req.body.address || "Main Mandi Road",
                        city: req.body.city || "Mumbai"
                    });
                } catch (e) {
                    console.warn("Could not auto-create buyer profile:", e.message);
                }
            }
        }

        // Issue refreshed JWT token with updated role
        const secret = process.env.JWT_SECRET || "super_secret_sih_farmer_market_key_2026";
        const token = jwt.sign({
            user_id: updatedUser.user_id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role
        }, secret, { expiresIn: "1d" });

        return res.send({
            error: false,
            data: updatedUser,
            user: updatedUser,
            token: token,
            message: "User updated successfully"
        });
    }
    return res.status(400).send({ error: true, message: "Failed to update user or user not found" });
}

async function deleteUser(req, res) {
    const targetId = Number(req.params.id);
    if (req.user.role !== "ADMIN" && req.user.user_id !== targetId) {
        return res.status(403).send({ error: true, message: "Forbidden: You can only delete your own user account" });
    }
    const data = await usersModel.deleteById(targetId);
    if (data && data.affectedRows > 0) {
        return res.send({ error: false, message: "User deleted successfully" });
    }
    return res.status(400).send({ error: true, message: "Failed to delete user or user not found" });
}

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
