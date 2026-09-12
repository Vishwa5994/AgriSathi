const express = require("express");
const { getAllListings, getListingById, getListingsByFarmer, getMyListings, createListing, updateListing, deleteListing } = require("../controllers/listings.controller");
const { authMiddleware, authorizeRoles } = require("../middleware/auth.middleware");

const router = express.Router();

// Static routes MUST come before parameterized /:id route
router.get("/", getAllListings);
router.get("/my-listings", authMiddleware, getMyListings);
router.get("/farmer/:farmer_id", getListingsByFarmer);
router.post("/", authMiddleware, authorizeRoles("FARMER", "ADMIN"), createListing);
router.put("/:id", authMiddleware, authorizeRoles("FARMER", "ADMIN"), updateListing);
router.delete("/:id", authMiddleware, authorizeRoles("FARMER", "ADMIN"), deleteListing);
// Parameterized route LAST — only matches numeric IDs
router.get("/:id", getListingById);

module.exports = router;
