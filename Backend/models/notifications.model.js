const db = require("../config/db");

async function getAll() {
    try {
        const [data] = await db.query("SELECT * FROM notifications ORDER BY notification_id DESC");
        return data;
    } catch (err) {
        console.error("notifications.model getAll error:", err);
        return false;
    }
}

async function getById(id) {
    try {
        const [data] = await db.query("SELECT * FROM notifications WHERE notification_id = ?", [id]);
        return data[0] || null;
    } catch (err) {
        console.error("notifications.model getById error:", err);
        return false;
    }
}

async function getByUserId(userId) {
    try {
        const [data] = await db.query("SELECT * FROM notifications WHERE user_id = ? ORDER BY notification_id DESC", [userId]);
        return data;
    } catch (err) {
        console.error("notifications.model getByUserId error:", err);
        return false;
    }
}

async function insert(notificationData, client = db) {
    try {
        const { user_id, title, message } = notificationData;
        const [result] = await client.query(
            "INSERT INTO notifications (user_id, title, message, is_read) VALUES (?, ?, ?, FALSE)",
            [user_id, title, message]
        );
        return result;
    } catch (err) {
        console.error("notifications.model insert error:", err);
        return false;
    }
}

async function markAsRead(id) {
    try {
        const [result] = await db.query("UPDATE notifications SET is_read = TRUE WHERE notification_id = ?", [id]);
        return result;
    } catch (err) {
        console.error("notifications.model markAsRead error:", err);
        return false;
    }
}

async function deleteById(id) {
    try {
        const [result] = await db.query("DELETE FROM notifications WHERE notification_id = ?", [id]);
        return result;
    } catch (err) {
        console.error("notifications.model deleteById error:", err);
        return false;
    }
}

module.exports = { getAll, getById, getByUserId, insert, markAsRead, deleteById };
