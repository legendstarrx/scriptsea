import { adminDb } from '../../lib/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, plan } = req.body;

    if (!userId || !plan) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    await userRef.update({
      subscription: plan,
      scriptsRemaining: plan === 'pro' ? 100 : 3,
      lastUpdated: new Date().toISOString()
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Subscription update error:', error);
    return res.status(500).json({ error: 'Failed to update subscription' });
  }
} 
 