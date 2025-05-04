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
      console.error('IPQUALITYSCORE_API_KEY not configured');
      return res.status(500).json({ 
        error: 'Configuration error',
        message: 'VPN detection service is not properly configured. Please contact support.'
      });
    }

    try {
      const vpnCheckUrl = `https://ipqualityscore.com/api/json/ip/${API_KEY}/${ip}`;
      const response = await fetch(vpnCheckUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`IPQualityScore API responded with status: ${response.status}`);
      }

      const data = await response.json();
      console.log('IPQualityScore response:', data); // Debug log

      if (!data.success) {
        console.error('IPQualityScore API error:', data.message);
        throw new Error(data.message || 'VPN check service error');
      }

      if (data.proxy || data.vpn) {
        return res.status(403).json({
          error: 'VPN detected',
          message: 'VPN/proxy usage is not allowed. Please disable your VPN and try again.',
          details: {
            proxy: data.proxy,
            vpn: data.vpn,
            tor: data.tor,
            fraud_score: data.fraud_score
          }
        });
      }

      // If everything is okay, return success with IP
      return res.status(200).json({ 
        success: true,
        ip,
        vpn_detected: false
      });

    } catch (vpnError) {
      console.error('VPN check error:', vpnError);
      // If VPN check fails, we should return an error
      return res.status(500).json({
        error: 'VPN check failed',
        message: 'Unable to verify VPN status. Please try again later.'
      });
    }
  } catch (error) {
    console.error('IP check error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'An unexpected error occurred. Please try again later.'
    });
  }
} 