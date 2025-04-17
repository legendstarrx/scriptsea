import { rateLimit } from '../../../middleware/rateLimit';
import { adminAuth } from '../../../lib/firebaseAdmin';

const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3 // 3 attempts per hour
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await resetLimiter(req, res);

  try {
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
    return res.status(400).json({ error: 'Failed to send reset email' });
  }
} 