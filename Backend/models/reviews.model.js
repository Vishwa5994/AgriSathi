const db = require("../config/db");

async function getAll() {
    try {
        const [data] = await db.query(`
            SELECT r.*, u_reviewer.name as reviewer_name, u_reviewee.name as reviewee_name 
            FROM reviews r
            JOIN users u_reviewer ON r.reviewer_id = u_reviewer.user_id
            JOIN users u_reviewee ON r.reviewee_id = u_reviewee.user_id
            ORDER BY r.review_id DESC
        `);
        return data;
    } catch (err) {
        console.error("reviews.model getAll error:", err);
        return false;
    }
}

async function getById(id) {
    try {
        const [data] = await db.query(`
            SELECT r.*, u_reviewer.name as reviewer_name, u_reviewee.name as reviewee_name 
            FROM reviews r
            JOIN users u_reviewer ON r.reviewer_id = u_reviewer.user_id
            JOIN users u_reviewee ON r.reviewee_id = u_reviewee.user_id
            WHERE r.review_id = ?
        `, [id]);
        return data[0] || null;
    } catch (err) {
        console.error("reviews.model getById error:", err);
        return false;
    }
}

async function getByOrderId(orderId) {
    try {
        const [data] = await db.query("SELECT * FROM reviews WHERE order_id = ? ORDER BY review_id DESC", [orderId]);
        return data;
    } catch (err) {
        console.error("reviews.model getByOrderId error:", err);
        return false;
    }
}

async function getByRevieweeId(revieweeId) {
    try {
        const [data] = await db.query(`
            SELECT r.*, u_reviewer.name as reviewer_name 
            FROM reviews r
            JOIN users u_reviewer ON r.reviewer_id = u_reviewer.user_id
            WHERE r.reviewee_id = ?
            ORDER BY r.review_id DESC
        `, [revieweeId]);
        return data;
    } catch (err) {
        console.error("reviews.model getByRevieweeId error:", err);
        return false;
    }
}

async function insert(reviewData) {
    try {
        const { order_id, reviewer_id, reviewee_id, rating, comment } = reviewData;
        const [result] = await db.query(
            "INSERT INTO reviews (order_id, reviewer_id, reviewee_id, rating, comment) VALUES (?, ?, ?, ?, ?)",
            [order_id, reviewer_id, reviewee_id, rating, comment || null]
        );
        return result;
    } catch (err) {
        console.error("reviews.model insert error:", err);
        return false;
    }
}

async function update(id, reviewData) {
    try {
        const { rating, comment } = reviewData;
        const [result] = await db.query(
            "UPDATE reviews SET rating = ?, comment = ? WHERE review_id = ?",
            [rating, comment || null, id]
        );
        return result;
    } catch (err) {
        console.error("reviews.model update error:", err);
        return false;
    }
}

async function deleteById(id) {
    try {
        const [result] = await db.query("DELETE FROM reviews WHERE review_id = ?", [id]);
        return result;
    } catch (err) {
        console.error("reviews.model deleteById error:", err);
        return false;
    }
}

module.exports = { getAll, getById, getByOrderId, getByRevieweeId, insert, update, deleteById };
