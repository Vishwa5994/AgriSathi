const express = require("express");
const { getAllListings, getListingById, getListingsByFarmer, createListing, updateListing, deleteListing } = require("../controllers/listings.controller");
const { authMiddleware, authorizeRoles } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", getAllListings);
router.get("/farmer/:farmer_id", getListingsByFarmer);
router.get("/:id", getListingById);
router.post("/", authMiddleware, authorizeRoles("FARMER", "ADMIN"), createListing);
router.put("/:id", authMiddleware, authorizeRoles("FARMER", "ADMIN"), updateListing);
router.delete("/:id", authMiddleware, authorizeRoles("FARMER", "ADMIN"), deleteListing);

module.exports = router;
