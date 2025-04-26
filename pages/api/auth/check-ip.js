import { adminDb } from '../../../lib/firebaseAdmin';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Get IP from various possible headers
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
               req.headers['x-real-ip'] || 
               req.headers['x-client-ip'] ||
               req.socket.remoteAddress;
    
    if (!ip) {
      console.error('No IP address found in request');
      return res.status(400).json({ error: 'No IP address found' });
    }

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
      console.warn('IPQUALITYSCORE_API_KEY not configured');
      return res.status(200).json({ ip }); // Continue without VPN check
    }

    try {
      const response = await fetch(`https://ipqualityscore.com/api/json/ip/${API_KEY}/${ip}?strictness=1&allow_public_access_points=true`);
      const data = await response.json();

      if (data.success) {
        if (data.proxy || data.vpn) {
          return res.status(403).json({
            error: 'VPN detected',
            message: 'VPN/proxy usage is not allowed. Please disable your VPN and try again.'
          });
        }
      } else {
        console.warn('IPQualityScore API error:', data.message);
      }
    } catch (vpnError) {
      console.error('VPN check error:', vpnError);
      // Continue without failing if VPN check fails
    }

    return res.status(200).json({ ip });
  } catch (error) {
    console.error('IP check error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 