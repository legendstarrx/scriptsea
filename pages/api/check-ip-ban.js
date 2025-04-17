import { adminDb } from '../../lib/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    // Check if IP is banned
    const bannedIpDoc = await adminDb.collection('banned_ips').doc(userIp).get();
    
    if (bannedIpDoc.exists()) {
      return res.status(403).json({ error: 'IP address is banned' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error checking IP ban:', error);
    return res.status(500).json({ error: 'Server error' });
  }
} 