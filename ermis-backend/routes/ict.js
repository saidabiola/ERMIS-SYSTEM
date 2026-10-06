const express = require("express");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const ictController = require("../controllers/ictController");

const router = express.Router();

// Same gate pattern as admin/records:
// 1) must be logged in (valid access token)
// 2) must be ICT officer or admin
router.use(protect);
router.use(restrictTo("ict_officer", "admin"));

router.get("/health", ictController.getHealth);

// Specific path before generic /backups list is fine — both are exact paths
router.get("/backups/latest", ictController.getLatestBackup);
router.get("/backups", ictController.listBackups);
router.post("/backups", ictController.createBackup);
router.post("/backups/:id/restore", ictController.restoreBackup);

module.exports = router;
