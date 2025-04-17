import rateLimit from 'express-rate-limit';

export const createRateLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 5,
    message: { error: 'Too many requests' },
    standardHeaders: true,
    legacyHeaders: false
  });
};

// Export configured instances
export const authLimiter = createRateLimiter();

export const resetLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3 // 3 attempts
});

// Export the creator function for custom limits
export const createLimiter = createRateLimiter; 