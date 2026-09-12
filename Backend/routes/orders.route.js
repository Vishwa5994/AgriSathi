const express = require("express");
const { getAllOrders, getOrderById, createOrder, updateOrderStatus, deleteOrder } = require("../controllers/orders.controller");
const { authMiddleware, authorizeRoles } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getAllOrders);
router.get("/:id", getOrderById);
router.post("/", authorizeRoles("BUYER", "ADMIN"), createOrder);
router.put("/:id/status", updateOrderStatus);
router.delete("/:id", authorizeRoles("ADMIN"), deleteOrder);

module.exports = router;
