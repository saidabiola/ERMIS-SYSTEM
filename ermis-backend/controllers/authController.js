const authService = require("../services/authService");
const { validateLoginBody } = require("../validators/authValidator");
const AppError = require("../utils/AppError");
const { REFRESH_TOKEN_MS } = require("../utils/tokens");

const REFRESH_COOKIE = "refreshToken";

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // lax works with top-level navigations; still blocks most CSRF
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: REFRESH_TOKEN_MS,
    path: "/api/auth",
  };
}

function setRefreshCookie(res, refreshToken) {
  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    path: "/api/auth",
  });
}

async function login(req, res) {
  try {
    const { email, password } = validateLoginBody(req.body);
    const result = await authService.login(email, password);

    setRefreshCookie(res, result.refreshToken);

    // Access token in JSON body — frontend stores it for Authorization header
    res.json({
      accessToken: result.accessToken,
      role: result.role,
      name: result.name,
    });
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error, please try again" });
  }
}

async function refresh(req, res) {
  try {
    const rawToken = req.cookies?.[REFRESH_COOKIE];
    const result = await authService.refresh(rawToken);

    // Rotation: replace cookie with the new refresh token
    setRefreshCookie(res, result.refreshToken);

    res.json({ accessToken: result.accessToken });
  } catch (err) {
    clearRefreshCookie(res);
    if (err instanceof AppError) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error("Refresh error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

async function logout(req, res) {
  try {
    const rawToken = req.cookies?.[REFRESH_COOKIE];
    await authService.logout(rawToken);
    clearRefreshCookie(res);
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    clearRefreshCookie(res);
    console.error("Logout error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = { login, refresh, logout };
