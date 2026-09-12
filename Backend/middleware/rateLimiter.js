const { Redis } = require("@upstash/redis");
const { Ratelimit } = require("@upstash/ratelimit");

// Redis.fromEnv() reads UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
// from process.env — dotenv.config() must be called before this file is imported.
const redis = Redis.fromEnv();

const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(15, "1 m"), // 15 requests per 1 minute
    analytics: true,
    prefix: "agrisathi:ratelimit",
});

/**
 * Express middleware that rate-limits requests per authenticated user (user_id)
 * or per IP address for unauthenticated requests.
 * Fails open — if Redis is unreachable the request is allowed through.
 */
async function rateLimiterMiddleware(req, res, next) {
    try {
        // Prefer authenticated user ID, fall back to IP
        const identifier =
            (req.user && req.user.user_id)
                ? `user:${req.user.user_id}`
                : `ip:${req.ip}`;

        const { success, limit, remaining, reset } = await ratelimit.limit(identifier);

        // Always set rate-limit headers so clients can self-throttle
        res.setHeader("X-RateLimit-Limit", limit);
        res.setHeader("X-RateLimit-Remaining", remaining);
        res.setHeader("X-RateLimit-Reset", reset);

        if (!success) {
            return res.status(429).json({
                error: true,
                message: "Too many requests. Please slow down and try again shortly.",
            });
        }

        next();
    } catch (err) {
        // Fail open — if Redis is down, don't block the user
        console.error("Rate limiter error (failing open):", err.message);
        next();
    }
}

module.exports = rateLimiterMiddleware;
