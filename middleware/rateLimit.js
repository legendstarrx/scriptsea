import rateLimit from 'express-rate-limit';

const createRateLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes default
    max: options.max || 5, // 5 requests default
    message: { error: 'Too many requests, please try again later' },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
      res.status(429).json({ error: 'Too many requests, please try again later' });
    }
  });
};

// Export a configured instance for auth
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // 5 attempts
});

// Export a configured instance for password reset
export const resetLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3 // 3 attempts
});

// Export the creator function for custom limits
export const createLimiter = createRateLimiter; 