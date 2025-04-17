import { adminDb } from '../../../lib/firebaseAdmin';
import { verifyAdmin } from '../../../lib/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await verifyAdmin(req);
    const { ipAddress } = req.body;

    if (!ipAddress) {
      return res.status(400).json({ error: 'IP address is required' });
    }

    await adminDb.collection('banned_ips').doc(ipAddress).set({
      bannedAt: new Date().toISOString(),
      bannedBy: req.body.adminEmail
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error banning IP:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
} 