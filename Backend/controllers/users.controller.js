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

async function updateUser(req, res) {
    const targetId = Number(req.params.id);
    if (req.user.role !== "ADMIN" && req.user.user_id !== targetId) {
        return res.status(403).send({ error: true, message: "Forbidden: You can only update your own user account" });
    }
    const data = await usersModel.update(targetId, req.body);
    if (data && data.affectedRows > 0) {
        return res.send({ error: false, message: "User updated successfully" });
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
