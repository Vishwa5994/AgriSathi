const express = require("express");
const { getAllProfiles, getProfileById, createProfile, updateProfile, deleteProfile } = require("../controllers/buyerProfiles.controller");
const { authMiddleware, authorizeRoles } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getAllProfiles);
router.get("/:id", getProfileById);
router.post("/", authorizeRoles("BUYER", "ADMIN"), createProfile);
router.put("/:id", authorizeRoles("BUYER", "ADMIN"), updateProfile);
router.delete("/:id", deleteProfile);

module.exports = router;
