const express = require("express");
const { getAllUsers, getUserById, updateUser, deleteUser } = require("../controllers/users.controller");
const { register, login } = require("../controllers/auth.controller");
const { authMiddleware, authorizeRoles } = require("../middleware/auth.middleware");

const router = express.Router();

// Public registration & login endpoints
router.post("/", register);
router.post("/register", register);
router.post("/login", login);

// Authenticated user management endpoints
router.use(authMiddleware);

router.get("/", authorizeRoles("ADMIN"), getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
