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

    // Debug log the IP
    console.log('Checking IP:', ip);

    // Check if IP is banned
    const bannedIpDoc = await adminDb.collection('banned_ips').doc(ip).get();
    
    if (bannedIpDoc.exists) {
      return res.status(403).json({ 
        error: 'IP banned',
        message: 'This IP address has been banned. Please contact support.' 
      });
    }

    // Check if IP is a VPN/proxy using IPQualityScore
    const API_KEY = process.env.PQUALITYSCORE_API_KEY;
    
    // Debug log API key status (don't log the actual key)
    console.log('API Key status:', {
      exists: !!API_KEY,
      length: API_KEY?.length,
      isPlaceholder: API_KEY === 'your_ipqualityscore_api_key_here'
    });

    if (!API_KEY || API_KEY === 'your_ipqualityscore_api_key_here') {
      console.warn('PQUALITYSCORE_API_KEY not properly configured');
      return res.status(200).json({ 
        success: true,
        ip,
        vpn_detected: false,
        vpn_check_skipped: true,
        debug_info: {
          reason: 'API_KEY_MISSING_OR_INVALID'
        }
      });
    }

    try {
      const vpnCheckUrl = `https://ipqualityscore.com/api/json/ip/${API_KEY}/${ip}?strictness=1&allow_public_access_points=true`;
      console.log('Making request to:', vpnCheckUrl.replace(API_KEY, 'HIDDEN'));

      const response = await fetch(vpnCheckUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      console.log('API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('IPQualityScore API error response:', errorText);
        return res.status(200).json({ 
          success: true,
          ip,
          vpn_detected: false,
          vpn_check_failed: true,
          debug_info: {
            status: response.status,
            error: errorText
          }
        });
      }

      const data = await response.json();
      console.log('IPQualityScore API response:', {
        success: data.success,
        proxy: data.proxy,
        vpn: data.vpn,
        fraud_score: data.fraud_score
      });

      if (!data.success) {
        console.error('IPQualityScore API error:', data.message);
        return res.status(200).json({ 
          success: true,
          ip,
          vpn_detected: false,
          vpn_check_failed: true,
          debug_info: {
            api_error: data.message
          }
        });
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

      return res.status(200).json({ 
        success: true,
        ip,
        vpn_detected: false,
        debug_info: {
          checked: true,
          proxy: data.proxy,
          vpn: data.vpn
        }
      });

    } catch (vpnError) {
      console.error('VPN check error:', vpnError);
      return res.status(200).json({ 
        success: true,
        ip,
        vpn_detected: false,
        vpn_check_failed: true,
        debug_info: {
          error: vpnError.message
        }
      });
    }
  } catch (error) {
    console.error('IP check error:', error);
    return res.status(200).json({ 
      success: true,
      ip: req.headers['x-forwarded-for'] || 'unknown',
      vpn_detected: false,
      check_failed: true,
      debug_info: {
        error: error.message
      }
    });
  }
} 