const express = require("express");
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } = require("../controllers/products.controller");
const { authMiddleware, authorizeRoles } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", authMiddleware, authorizeRoles("ADMIN", "FARMER"), createProduct);
router.put("/:id", authMiddleware, authorizeRoles("ADMIN"), updateProduct);
router.delete("/:id", authMiddleware, authorizeRoles("ADMIN"), deleteProduct);

module.exports = router;
