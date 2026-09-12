const express = require("express");
const { getAllProfiles, getProfileById, createProfile, updateProfile, deleteProfile } = require("../controllers/farmerProfiles.controller");
const { authMiddleware, authorizeRoles } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getAllProfiles);
router.get("/:id", getProfileById);
router.post("/", authorizeRoles("FARMER", "ADMIN"), createProfile);
router.put("/:id", authorizeRoles("FARMER", "ADMIN"), updateProfile);
router.delete("/:id", deleteProfile);

module.exports = router;
