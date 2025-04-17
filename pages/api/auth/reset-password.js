import { adminAuth } from '../../../lib/firebaseAdmin';
import { authLimiter } from '../../../middleware/rateLimit';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await authLimiter(req, res);

  try {
    const { email } = req.body;
    
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