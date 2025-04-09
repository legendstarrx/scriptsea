import { getIpAddress } from '../../../utils/request';

const rateLimit = {
  tokenBucket: new Map(),
  maxRequests: 100, // Maximum requests per window
  windowMs: 15 * 60 * 1000, // 15 minutes
};

export default function rateLimitMiddleware(req, res) {
  const ip = getIpAddress(req);
  const now = Date.now();
  const windowStart = now - rateLimit.windowMs;

  // Clean old entries
  if (!rateLimit.tokenBucket.has(ip)) {
    rateLimit.tokenBucket.set(ip, []);
  }

  const bucket = rateLimit.tokenBucket.get(ip);
  const validRequests = bucket.filter(timestamp => timestamp > windowStart);
  rateLimit.tokenBucket.set(ip, validRequests);

  if (validRequests.length >= rateLimit.maxRequests) {
    return res.status(429).json({
      error: 'Too many requests, please try again later.'
    });
  }

  // Add current request
  validRequests.push(now);
  rateLimit.tokenBucket.set(ip, validRequests);

  return null;
}

// Helper function to use in other API routes
export function withRateLimit(handler) {
  return async function rateLimit(req, res) {
    try {
      const rateLimitResult = rateLimitMiddleware(req, res);
      if (rateLimitResult) return rateLimitResult;
      
      return await handler(req, res);
    } catch (error) {
      console.error('Rate limit error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
} 