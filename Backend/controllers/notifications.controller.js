const notificationsModel = require("../models/notifications.model");

async function getAllNotifications(req, res) {
    const data = await notificationsModel.getAll();
    if (data !== false) {
        return res.send({ error: false, data, message: "Notifications retrieved successfully" });
    }
    return res.status(500).send({ error: true, message: "Failed to retrieve notifications" });
}

async function getUserNotifications(req, res) {
    const userId = req.params.user_id || req.user.user_id;
    const data = await notificationsModel.getByUserId(userId);
    if (data !== false) {
        return res.send({ error: false, data, message: "User notifications retrieved successfully" });
    }
    return res.status(500).send({ error: true, message: "Failed to retrieve user notifications" });
}

async function getNotificationById(req, res) {
    const data = await notificationsModel.getById(req.params.id);
    if (data) {
        return res.send({ error: false, data, message: "Notification retrieved successfully" });
    }
    return res.status(404).send({ error: true, message: "Notification not found" });
}

async function createNotification(req, res) {
    const { user_id, title, message } = req.body;
    if (!user_id || !title || !message) {
        return res.status(400).send({ error: true, message: "Validation Error: user_id, title, and message are required" });
    }

    const result = await notificationsModel.insert({ user_id, title, message });
    if (result && result.insertId) {
        return res.status(201).send({
            error: false,
            data: { notification_id: result.insertId, user_id, title, message },
            message: "Notification created successfully"
        });
    }
    return res.status(500).send({ error: true, message: "Failed to create notification" });
}

async function markNotificationRead(req, res) {
    const data = await notificationsModel.markAsRead(req.params.id);
    if (data && data.affectedRows > 0) {
        return res.send({ error: false, message: "Notification marked as read successfully" });
    }
    return res.status(400).send({ error: true, message: "Failed to mark notification as read" });
}

async function deleteNotification(req, res) {
    const data = await notificationsModel.deleteById(req.params.id);
    if (data && data.affectedRows > 0) {
        return res.send({ error: false, message: "Notification deleted successfully" });
    }
    return res.status(400).send({ error: true, message: "Failed to delete notification" });
}

module.exports = { getAllNotifications, getUserNotifications, getNotificationById, createNotification, markNotificationRead, deleteNotification };
