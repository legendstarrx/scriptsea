import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // 5 attempts
});

// Apply to your login and register API routes
export default function handler(req, res) {
  return authLimiter(req, res, () => {
    // Your existing login/register logic
  });
} 