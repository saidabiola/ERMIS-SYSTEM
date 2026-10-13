const multer = require("multer");
const path = require("path");

/** Max attachment size (must match nginx client_max_body_size) */
const MAX_FILE_BYTES = 25 * 1024 * 1024;

const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
]);

const ALLOWED_EXT = new Set([".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"]);

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname || "").toLowerCase();
  const mimeOk = ALLOWED_MIME.has(file.mimetype);
  const extOk = ALLOWED_EXT.has(ext);

  if (mimeOk && extOk) {
    return cb(null, true);
  }

  cb(
    new Error(
      "Invalid file type. Allowed: PDF, DOC, DOCX, JPG, PNG (max 25 MB)."
    )
  );
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_BYTES, files: 1 },
  fileFilter,
});

function uploadErrorMessage(err) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return "File too large. Maximum size is 25 MB.";
    }
    if (err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE") {
      return 'Only one file named "file" is allowed per request.';
    }
    return err.message;
  }
  return err.message || "Invalid upload";
}

/**
 * Multer single-file middleware that returns clear 400 JSON on rejection.
 */
function uploadSingle(fieldName = "file") {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: uploadErrorMessage(err) });
      }
      return next();
    });
  };
}

module.exports = {
  upload,
  uploadSingle,
  MAX_FILE_BYTES,
  ALLOWED_EXT,
};
