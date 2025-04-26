import { adminDb } from '../../../lib/firebaseAdmin';

export default async function handler(req, res) {
  try {
    // Get IP from request headers
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
    
    // Check if IP is banned
    const bannedIpDoc = await adminDb.collection('banned_ips').doc(ip).get();
    
    if (bannedIpDoc.exists) {
      return res.status(403).json({ 
        error: 'IP banned',
        message: 'This IP address has been banned. Please contact support.' 
      });
    }

    // Check if IP is a VPN/proxy using IPQualityScore
    const API_KEY = process.env.IPQUALITYSCORE_API_KEY;
    if (!API_KEY) {
      console.error('IPQUALITYSCORE_API_KEY not configured');
      return res.status(200).json({ ip });
    }

    const response = await fetch(`https://ipqualityscore.com/api/json/ip/${API_KEY}/${ip}?strictness=1&allow_public_access_points=true`);
    const data = await response.json();

    if (data.success && (data.proxy || data.vpn)) {
      return res.status(403).json({
        error: 'VPN detected',
        message: 'VPN/proxy usage is not allowed. Please disable your VPN and try again.'
      });
    }
    
    return res.status(200).json({ ip });
  } catch (error) {
    console.error('IP check error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 