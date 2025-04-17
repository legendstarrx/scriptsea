import { resetLimiter } from '../../../middleware/rateLimit';
import { adminAuth } from '../../../lib/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Apply rate limiting
    await new Promise((resolve, reject) => {
      resetLimiter(req, res, (result) => {
        if (result instanceof Error) {
          reject(result);
        } else {
          resolve(result);
        }
      });
    });

    const { email } = req.body;
    
    // Add basic validation
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    // Generate one-time reset token
    const resetLink = await adminAuth.generatePasswordResetLink(email, {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    });

    // Send email with reset link
    await sendResetEmail(email, resetLink);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(429).json({ error: 'Too many requests, please try again later' });
  }
} 