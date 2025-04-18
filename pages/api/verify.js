import { db } from '../../lib/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    const usersRef = db.collection('users');
    const querySnapshot = await usersRef
      .where('verificationToken', '==', token)
      .where('verificationTokenExpires', '>', Timestamp.now())
      .get();

    if (querySnapshot.empty) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const userDoc = querySnapshot.docs[0];
    await userDoc.ref.update({
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpires: null
    });

    res.redirect('/login?verified=true');
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ error: 'Failed to verify email' });
  }
} 