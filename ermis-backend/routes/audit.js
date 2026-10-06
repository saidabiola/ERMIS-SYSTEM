const express = require("express");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const auditController = require("../controllers/auditController");

const router = express.Router();

// Oversight roles only — officers create the actions; supervisors/admins review them
router.use(protect);
router.use(restrictTo("supervisor", "admin"));

router.get("/", auditController.listLogs);

module.exports = router;
