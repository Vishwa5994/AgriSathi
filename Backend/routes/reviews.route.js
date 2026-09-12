const express = require("express");
const { getAllReviews, getReviewById, getReviewsByOrder, getReviewsByReviewee, createReview, updateReview, deleteReview } = require("../controllers/reviews.controller");
const { authMiddleware, authorizeRoles } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", getAllReviews);
router.get("/order/:order_id", getReviewsByOrder);
router.get("/user/:reviewee_id", getReviewsByReviewee);
router.get("/:id", getReviewById);
router.post("/", authMiddleware, authorizeRoles("BUYER", "ADMIN"), createReview);
router.put("/:id", authMiddleware, updateReview);
router.delete("/:id", authMiddleware, authorizeRoles("ADMIN"), deleteReview);

module.exports = router;
