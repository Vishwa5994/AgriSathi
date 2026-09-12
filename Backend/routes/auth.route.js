const express = require("express");
const { register, login, googleAuth, getMe, logout } = require("../controllers/auth.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuth);
router.get("/me", authMiddleware, getMe);
router.post("/logout", authMiddleware, logout);

module.exports = router;
