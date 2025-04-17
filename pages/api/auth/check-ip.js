import { db } from '../../../lib/firebaseAdmin';

export default async function handler(req, res) {
  try {
    // Get IP from request headers
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
    
    // Check if IP is banned
    const bannedIpDoc = await db.collection('banned_ips').doc(ip).get();
    
    if (bannedIpDoc.exists) {
      // Double check if this IP was actually unbanned
      const bannedIpData = bannedIpDoc.data();
      if (bannedIpData.unbannedAt) {
        // If the IP was unbanned, delete the document
        await db.collection('banned_ips').doc(ip).delete();
        return res.status(200).json({ ip });
      }
      
      return res.status(403).json({ 
        error: 'IP banned',
        message: 'This IP address has been banned. Please contact support.' 
      });
    }
    
    return res.status(200).json({ ip });
  } catch (error) {
    console.error('IP check error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 