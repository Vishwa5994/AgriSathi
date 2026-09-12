const reviewsModel = require("../models/reviews.model");
const ordersModel = require("../models/orders.model");

async function getAllReviews(req, res) {
    const data = await reviewsModel.getAll();
    if (data !== false) {
        return res.send({ error: false, data, message: "Reviews retrieved successfully" });
    }
    return res.status(500).send({ error: true, message: "Failed to retrieve reviews" });
}

async function getReviewById(req, res) {
    const data = await reviewsModel.getById(req.params.id);
    if (data) {
        return res.send({ error: false, data, message: "Review retrieved successfully" });
    }
    return res.status(404).send({ error: true, message: "Review not found" });
}

async function getReviewsByOrder(req, res) {
    const data = await reviewsModel.getByOrderId(req.params.order_id);
    if (data !== false) {
        return res.send({ error: false, data, message: "Order reviews retrieved successfully" });
    }
    return res.status(500).send({ error: true, message: "Failed to retrieve order reviews" });
}

async function getReviewsByReviewee(req, res) {
    const data = await reviewsModel.getByRevieweeId(req.params.reviewee_id);
    if (data !== false) {
        return res.send({ error: false, data, message: "User reviews retrieved successfully" });
    }
    return res.status(500).send({ error: true, message: "Failed to retrieve user reviews" });
}

async function createReview(req, res) {
    const reviewer_id = req.user ? req.user.user_id : req.body.reviewer_id;
    const { order_id, reviewee_id, rating, comment } = req.body;

    if (!order_id || !reviewee_id || !rating) {
        return res.status(400).send({
            error: true,
            message: "Validation Error: order_id, reviewee_id, and rating are required"
        });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).send({
            error: true,
            message: "Validation Error: rating must be an integer between 1 and 5"
        });
    }

    const order = await ordersModel.getById(order_id);
    if (!order) {
        return res.status(404).send({ error: true, message: "Order not found" });
    }

    const result = await reviewsModel.insert({ order_id, reviewer_id, reviewee_id, rating, comment });
    if (result && result.insertId) {
        return res.status(201).send({
            error: false,
            data: { review_id: result.insertId, order_id, reviewer_id, reviewee_id, rating, comment },
            message: "Review created successfully"
        });
    }
    return res.status(500).send({ error: true, message: "Failed to create review" });
}

async function updateReview(req, res) {
    const data = await reviewsModel.update(req.params.id, req.body);
    if (data && data.affectedRows > 0) {
        return res.send({ error: false, message: "Review updated successfully" });
    }
    return res.status(400).send({ error: true, message: "Failed to update review" });
}

async function deleteReview(req, res) {
    const data = await reviewsModel.deleteById(req.params.id);
    if (data && data.affectedRows > 0) {
        return res.send({ error: false, message: "Review deleted successfully" });
    }
    return res.status(400).send({ error: true, message: "Failed to delete review" });
}

module.exports = { getAllReviews, getReviewById, getReviewsByOrder, getReviewsByReviewee, createReview, updateReview, deleteReview };
