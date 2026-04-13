const redis = require("../config/redis");

const WINDOW_SIZE = 60; // seconds
const MAX_REQUESTS = 5;

const rateLimiter = async (req, res, next) => {
  try {
    const ip = req.ip;

    const key = `rate:${ip}`;

    const requests = await redis.incr(key);

    // First request → set expiry
    if (requests === 1) {
      await redis.expire(key, WINDOW_SIZE);
    }

    if (requests > MAX_REQUESTS) {
      return res.status(429).json({
        message: "Too many requests, try again later"
      });
    }

    next();

  } catch (err) {
    console.error(err);
    next(); // fail-safe
  }
};

module.exports = rateLimiter;
