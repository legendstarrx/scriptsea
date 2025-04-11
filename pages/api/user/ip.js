import { adminDb } from '../../../lib/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, ipAddress } = req.body;

    if (!userId || !ipAddress) {
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