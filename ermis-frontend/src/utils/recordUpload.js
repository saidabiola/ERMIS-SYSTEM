/** Keep in sync with ermis-backend/config/multer.js */
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

const ALLOWED_EXT = new Set([".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"]);

/**
 * Client-side check before FormData upload.
 * @returns {string|null} error message, or null if OK / no file
 */
export function validateRecordFile(file) {
  if (!file) return null;

  const name = file.name || "";
  const dot = name.lastIndexOf(".");
  const ext = dot >= 0 ? name.slice(dot).toLowerCase() : "";

  if (!ALLOWED_EXT.has(ext)) {
    return "Invalid file type. Allowed: PDF, DOC, DOCX, JPG, PNG (max 25 MB).";
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return "File too large. Maximum size is 25 MB.";
  }

  return null;
}
