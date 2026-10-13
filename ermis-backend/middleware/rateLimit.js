/**
 * Simple in-memory rate limiter (one EC2 / one Node process).
 * Enough for ExamTrack until you scale to multiple servers (then use Redis).
 */

function createRateLimiter({
  windowMs,
  max,
  message = "Too many requests. Please try again later.",
}) {
  /** @type {Map<string, { count: number, resetAt: number }>} */
  const hits = new Map();

  // Periodic cleanup so the Map does not grow forever
  const cleanupEvery = Math.min(windowMs, 60 * 1000);
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key);
    }
  }, cleanupEvery).unref();

  return function rateLimiter(req, res, next) {
    const key = req.ip || req.socket?.remoteAddress || "unknown";
    const now = Date.now();
    let entry = hits.get(key);

    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }

    entry.count += 1;

    const remaining = Math.max(0, max - entry.count);
    res.setHeader("RateLimit-Limit", String(max));
    res.setHeader("RateLimit-Remaining", String(remaining));
    res.setHeader(
      "RateLimit-Reset",
      String(Math.ceil(entry.resetAt / 1000))
    );

    if (entry.count > max) {
      const retryAfterSec = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
      res.setHeader("Retry-After", String(retryAfterSec));
      return res.status(429).json({ message });
    }

    return next();
  };
}

/** Login: 10 attempts / IP / 15 minutes */
const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many login attempts. Please try again in 15 minutes.",
});

/** General API: 300 requests / IP / 15 minutes */
const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: "Too many requests. Please slow down and try again shortly.",
});

module.exports = {
  createRateLimiter,
  loginLimiter,
  apiLimiter,
};
