const express = require("express");
const router = express.Router();
const { authMiddleware, authorizeRoles } = require("../middleware/auth.middleware");
const {
    getFarmerDashboard,
    getBuyerDashboard,
    getAdminDashboard
} = require("../controllers/dashboard.controller");

// Apply authMiddleware to all dashboard routes
router.use(authMiddleware);

// Farmer dashboard aggregate metrics (scoped to req.user.user_id)
router.get("/farmer", getFarmerDashboard);

// Buyer dashboard aggregate metrics (scoped to req.user.user_id)
router.get("/buyer", getBuyerDashboard);

// Admin dashboard aggregate metrics (restricted to ADMIN role)
router.get("/admin", authorizeRoles("ADMIN"), getAdminDashboard);

module.exports = router;
