import { adminAuth } from '../../../lib/firebaseAdmin';

export default async function handler(req, res) {
  try {
    const { uid } = req.body;
    await adminAuth.revokeRefreshTokens(uid);
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to revoke session' });
  }
} 