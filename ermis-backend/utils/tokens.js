const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_DAYS = 7;
const REFRESH_TOKEN_MS = REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000;

function getAccessSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing from environment");
  }
  return process.env.JWT_SECRET;
}

/** Short-lived JWT used on every API request */
function signAccessToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
      name: user.name,
      type: "access",
    },
    getAccessSecret(),
    { expiresIn: ACCESS_TOKEN_TTL }
  );
}

function verifyAccessToken(token) {
  const decoded = jwt.verify(token, getAccessSecret());
  if (decoded.type && decoded.type !== "access") {
    throw new Error("Invalid access token type");
  }
  return decoded;
}

/** Opaque random string — not a JWT (safer for refresh cookies) */
function generateRefreshToken() {
  return crypto.randomBytes(40).toString("hex");
}

/** Always store hashes in DB, never the raw refresh token */
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function refreshExpiryDate() {
  return new Date(Date.now() + REFRESH_TOKEN_MS);
}

module.exports = {
  ACCESS_TOKEN_TTL,
  REFRESH_TOKEN_DAYS,
  REFRESH_TOKEN_MS,
  signAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  hashToken,
  refreshExpiryDate,
};
