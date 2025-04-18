import { adminAuth } from '../../../lib/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.body;
    
    // Verify the Firebase token
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    return res.status(200).json({ uid: decodedToken.uid });
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
} 