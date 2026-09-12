const express = require("express");
const { getAllDeliveries, getDeliveryById, getDeliveryByOrder, createDelivery, updateDeliveryStatus, updateDelivery, deleteDelivery } = require("../controllers/delivery.controller");
const { authMiddleware, authorizeRoles } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getAllDeliveries);
router.get("/order/:order_id", getDeliveryByOrder);
router.get("/:id", getDeliveryById);
router.post("/", createDelivery);
router.put("/:id/status", updateDeliveryStatus);
router.put("/:id", updateDelivery);
router.delete("/:id", authorizeRoles("ADMIN"), deleteDelivery);

module.exports = router;
