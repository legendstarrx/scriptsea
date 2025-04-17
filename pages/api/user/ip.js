import { adminDb } from '../../../lib/firebaseAdmin';
import requestIp from 'request-ip';  // You'll need to install this package

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;
    const ipAddress = requestIp.getClientIp(req) || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    if (!userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const userRef = adminDb.collection('users').doc(userId);
    await userRef.update({
      ipAddress,
      lastUpdated: new Date().toISOString()
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating IP:', error);
    return res.status(500).json({ error: 'Failed to update IP' });
  }
} 