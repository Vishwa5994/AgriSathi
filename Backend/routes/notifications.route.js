const express = require("express");
const { getAllNotifications, getUserNotifications, getNotificationById, createNotification, markNotificationRead, deleteNotification } = require("../controllers/notifications.controller");
const { authMiddleware, authorizeRoles } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", authorizeRoles("ADMIN"), getAllNotifications);
router.get("/user/:user_id", getUserNotifications);
router.get("/my", (req, res, next) => {
    req.params.user_id = req.user.user_id;
    return getUserNotifications(req, res, next);
});
router.get("/:id", getNotificationById);
router.post("/", createNotification);
router.put("/:id/read", markNotificationRead);
router.delete("/:id", deleteNotification);

module.exports = router;
