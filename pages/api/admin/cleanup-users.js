import { adminDb } from '../../../lib/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify admin authorization
  if (req.headers.authorization !== `Bearer ${process.env.NEXT_PUBLIC_ADMIN_API_KEY}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const usersRef = adminDb.collection('users');
    const snapshot = await usersRef.get();
    let updatedCount = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      let updateData = {};

      if (data.subscription === 'free') {
        updateData = {
          scriptsRemaining: Math.min(data.scriptsRemaining || 0, 3),
          scriptsLimit: 3,
          subscriptionType: 'free',
          subscriptionEnd: null
        };
      } else if (data.subscription === 'pro') {
        updateData = {
          scriptsRemaining: Math.min(data.scriptsRemaining || 0, 100),
          scriptsLimit: 100,
          subscriptionType: data.subscriptionType || 'monthly'
        };
      }

      if (Object.keys(updateData).length > 0) {
        await doc.ref.update(updateData);
        updatedCount++;
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: `Updated ${updatedCount} users` 
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return res.status(500).json({ error: 'Failed to cleanup users' });
  }
} 