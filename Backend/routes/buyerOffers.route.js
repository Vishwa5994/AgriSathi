const express = require("express");
const { getAllOffers, getOfferById, getOffersByListing, getOffersByBuyer, createOffer, updateOfferStatus, deleteOffer } = require("../controllers/buyerOffers.controller");
const { authMiddleware, authorizeRoles } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getAllOffers);
router.get("/listing/:listing_id", getOffersByListing);
router.get("/buyer/:buyer_id", getOffersByBuyer);
router.get("/:id", getOfferById);
router.post("/", authorizeRoles("BUYER", "ADMIN"), createOffer);
router.put("/:id", updateOfferStatus);
router.delete("/:id", authorizeRoles("BUYER", "ADMIN"), deleteOffer);

module.exports = router;
