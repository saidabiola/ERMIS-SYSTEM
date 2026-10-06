const express = require("express");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const approvalController = require("../controllers/approvalController");

const router = express.Router();

router.use(protect);
router.use(restrictTo("supervisor", "admin"));

router.get("/", approvalController.listApprovals);
router.post("/:id/approve", approvalController.approve);
router.post("/:id/reject", approvalController.reject);

module.exports = router;
