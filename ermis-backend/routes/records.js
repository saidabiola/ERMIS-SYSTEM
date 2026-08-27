const express = require("express");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const { upload } = require("../config/multer");
const recordController = require("../controllers/recordController");

const router = express.Router();

router.use(protect);
router.use(restrictTo("records_officer", "admin", "supervisor"));

router.get("/", recordController.listRecords);
router.post(
  "/",
  restrictTo("records_officer", "admin"),
  upload.single("file"),
  recordController.createRecord
);
router.get("/:id", recordController.getRecord);

module.exports = router;
