import { adminDb } from '../../lib/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get the user's IP address
    const ip = req.headers['x-forwarded-for'] || 
               req.headers['x-real-ip'] || 
               req.socket.remoteAddress || 
               'Unknown';

    // Update the user's document with their IP
    await adminDb.collection('users').doc(userId).update({
      ipAddress: ip,
      lastUpdated: new Date().toISOString()
    });

    res.status(200).json({ success: true, ip });
  } catch (error) {
    console.error('Error updating IP:', error);
    res.status(500).json({ error: 'Failed to update IP' });
  }
} 