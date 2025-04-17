import { adminDb } from '../../../lib/firebaseAdmin';
import { getClientIp } from 'request-ip';
import isValidIP from 'is-ip';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;
    const clientIp = getClientIp(req);

    if (!clientIp || !isValidIP(clientIp)) {
      return res.status(400).json({ error: 'Invalid IP address' });
    }

    // Check if IP is banned
    const bannedIp = await adminDb.collection('banned_ips').doc(clientIp).get();
    if (bannedIp.exists) {
      return res.status(403).json({ error: 'IP address is banned' });
    }

    await adminDb.collection('users').doc(userId).update({
      ipAddress: clientIp,
      lastLoginIp: clientIp,
      lastLoginAt: new Date().toISOString()
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('IP update error:', error);
    return res.status(500).json({ error: 'Failed to update IP' });
  }
} 