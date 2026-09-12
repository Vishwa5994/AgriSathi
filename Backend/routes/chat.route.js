const express = require("express");
const { handleChatMessage } = require("../controllers/chat.controller");
const { optionalAuthMiddleware } = require("../middleware/auth.middleware");

const router = express.Router();

// POST /api/chat - RAG Augmented AI Chatbot
router.post("/", optionalAuthMiddleware, handleChatMessage);

module.exports = router;
