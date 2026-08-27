const bcrypt = require("bcrypt");
const userRepository = require("../repositories/userRepository");
const refreshTokenRepository = require("../repositories/refreshTokenRepository");
const AppError = require("../utils/AppError");
const {
  signAccessToken,
  generateRefreshToken,
  refreshExpiryDate,
} = require("../utils/tokens");

async function login(email, password) {
  const user = await userRepository.findActiveByEmail(email);
  if (!user) {
    throw new AppError("Wrong email and or password", 401);
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new AppError("Wrong email and or password", 401);
  }

  const accessToken = signAccessToken(user);
  const refreshToken = generateRefreshToken();

  // Store HASH only — raw token goes to the httpOnly cookie
  await refreshTokenRepository.create({
    userId: user._id,
    rawToken: refreshToken,
    expiresAt: refreshExpiryDate(),
  });

  return {
    accessToken,
    refreshToken,
    role: user.role,
    name: user.name,
  };
}

/**
 * Exchange a valid refresh cookie for a new access token.
 * Rotates the refresh token (old one revoked, new one issued).
 */
async function refresh(rawRefreshToken) {
  if (!rawRefreshToken) {
    throw new AppError("No refresh token provided", 401);
  }

  const stored = await refreshTokenRepository.findValidByRawToken(rawRefreshToken);
  if (!stored) {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  const user = await userRepository.findActiveById(stored.user);
  if (!user) {
    await refreshTokenRepository.revokeById(stored._id);
    throw new AppError("Invalid or expired refresh token", 401);
  }

  // Rotate: revoke old refresh token so it cannot be reused
  await refreshTokenRepository.revokeById(stored._id);

  const accessToken = signAccessToken(user);
  const newRefreshToken = generateRefreshToken();

  await refreshTokenRepository.create({
    userId: user._id,
    rawToken: newRefreshToken,
    expiresAt: refreshExpiryDate(),
  });

  return { accessToken, refreshToken: newRefreshToken };
}

async function logout(rawRefreshToken) {
  if (rawRefreshToken) {
    await refreshTokenRepository.revokeByRawToken(rawRefreshToken);
  }
  return { message: "Logged out successfully" };
}

module.exports = { login, refresh, logout };
