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
// Authenticated download — must be before /:id if we ever conflict; here path is distinct
router.get("/:id/file", recordController.downloadFile);
router.get("/:id", recordController.getRecord);

// Officers (and admin) can correct or remove records — supervisors stay read-only
router.put(
  "/:id",
  restrictTo("records_officer", "admin"),
  upload.single("file"),
  recordController.updateRecord
);
router.delete(
  "/:id",
  restrictTo("records_officer", "admin"),
  recordController.deleteRecord
);

module.exports = router;
