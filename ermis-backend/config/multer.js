const multer = require("multer");

/**
 * Always buffer in memory; storageService.saveUpload writes to S3 or local disk.
 * (S3_BUCKET empty → local uploads/; set → private S3)
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

module.exports = { upload };
