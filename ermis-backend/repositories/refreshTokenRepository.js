const RefreshToken = require("../models/RefreshToken");
const { hashToken } = require("../utils/tokens");

/**
 * Persist a refresh token as a SHA-256 hash (never store the raw cookie value).
 */
async function create({ userId, rawToken, expiresAt }) {
  return RefreshToken.create({
    user: userId,
    tokenHash: hashToken(rawToken),
    expiresAt,
  });
}

/**
 * Find a refresh token that is not revoked and not expired.
 */
async function findValidByRawToken(rawToken) {
  return RefreshToken.findOne({
    tokenHash: hashToken(rawToken),
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });
}

/**
 * Revoke by the raw cookie value (hashes first, then updates).
 */
async function revokeByRawToken(rawToken) {
  return RefreshToken.findOneAndUpdate(
    { tokenHash: hashToken(rawToken), revokedAt: null },
    { revokedAt: new Date() },
    { new: true }
  );
}

/**
 * Revoke a specific DB document (used during token rotation).
 */
async function revokeById(id) {
  return RefreshToken.findByIdAndUpdate(
    id,
    { revokedAt: new Date() },
    { new: true }
  );
}

/**
 * Revoke every active refresh token for a user (logout-all-devices style).
 */
async function revokeAllForUser(userId) {
  return RefreshToken.updateMany(
    { user: userId, revokedAt: null },
    { revokedAt: new Date() }
  );
}

module.exports = {
  create,
  findValidByRawToken,
  revokeByRawToken,
  revokeById,
  revokeAllForUser,
};
