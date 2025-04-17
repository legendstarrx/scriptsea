import { adminAuth } from '../../../lib/firebaseAdmin';

export default async function handler(req, res) {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const isAdmin = decodedToken.email === process.env.ADMIN_EMAIL; // Not NEXT_PUBLIC
    return res.status(200).json({ isAdmin });
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
} 