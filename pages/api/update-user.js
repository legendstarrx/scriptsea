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

    await adminDb.collection('users').doc(userId).set({
      subscription: 'free',
      scriptsRemaining: 3,
      scriptsGenerated: 0,
      createdAt: new Date().toISOString()
    }, { merge: true });

    res.status(200).json({ success: true, message: 'User document updated successfully' });
  } catch (error) {
    console.error('Error updating user document:', error);
    res.status(500).json({ error: 'Failed to update user document' });
  }
} 