import { db } from '../../lib/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, ipAddress } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get the IP address from the request if not provided
    const userIp = ipAddress || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    await db.collection('users').doc(userId).set({
      subscription: 'free',
      scriptsRemaining: 3,
      scriptsGenerated: 0,
      createdAt: new Date().toISOString(),
      ipAddress: userIp,
      lastLoginIp: userIp,
      lastLoginAt: new Date().toISOString()
    }, { merge: true });

    res.status(200).json({ success: true, message: 'User document updated successfully' });
  } catch (error) {
    console.error('Error updating user document:', error);
    res.status(500).json({ error: 'Failed to update user document' });
  }
} 