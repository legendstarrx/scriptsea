import rateLimit from 'express-rate-limit';
import { getIP } from '../../../utils/request';

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  keyGenerator: (req) => getIP(req)
});

export { adminLimiter }; 