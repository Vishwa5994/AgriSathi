const express = require("express");
const { getAllPayments, getPaymentById, getPaymentsByOrder, createPayment, updatePaymentStatus, deletePayment } = require("../controllers/payments.controller");
const { authMiddleware, authorizeRoles } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getAllPayments);
router.get("/order/:order_id", getPaymentsByOrder);
router.get("/:id", getPaymentById);
router.post("/", createPayment);
router.put("/:id/status", updatePaymentStatus);
router.delete("/:id", authorizeRoles("ADMIN"), deletePayment);

module.exports = router;
