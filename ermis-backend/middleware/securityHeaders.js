/**
 * Lightweight security headers (helmet-style) without an extra dependency.
 * Safe defaults for an API behind nginx / same-origin SPA.
 */
function securityHeaders(req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-DNS-Prefetch-Control", "off");
  // API does not need a rich CSP; browsers loading the SPA get CSP from nginx later if needed
  res.removeHeader("X-Powered-By");
  next();
}

module.exports = { securityHeaders };
