import { authLimiter } from '../../../middleware/rateLimit';

export default function handler(req, res, next) {
  return authLimiter(req, res, next);
} 