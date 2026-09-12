const express = require("express");
const { getAllPriceHistory, getPriceHistoryById, getPriceHistoryByProduct, createPriceHistory, updatePriceHistory, deletePriceHistory } = require("../controllers/priceHistory.controller");
const { authMiddleware, authorizeRoles } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", getAllPriceHistory);
router.get("/product/:product_id", getPriceHistoryByProduct);
router.get("/:id", getPriceHistoryById);
router.post("/", authMiddleware, authorizeRoles("ADMIN"), createPriceHistory);
router.put("/:id", authMiddleware, authorizeRoles("ADMIN"), updatePriceHistory);
router.delete("/:id", authMiddleware, authorizeRoles("ADMIN"), deletePriceHistory);

module.exports = router;
