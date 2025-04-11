import { adminDb, adminAuth } from '../../lib/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify admin API key
    if (req.headers.authorization !== process.env.NEXT_PUBLIC_ADMIN_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { userId, action, data } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    switch (action) {
      case 'updateSubscription':
        if (!data.plan) {
          return res.status(400).json({ error: 'Plan is required' });
        }
        
        await userRef.update({
          subscription: data.plan,
          scriptsRemaining: data.plan === 'pro' ? 100 : 3,
          lastUpdated: new Date().toISOString()
        });
        break;

      case 'resetScripts':
        const currentUser = userDoc.data();
        const scriptsCount = currentUser.subscription === 'pro' ? 100 : 3;
        
        await userRef.update({
          scriptsRemaining: scriptsCount,
          lastUpdated: new Date().toISOString()
        });
        break;

      case 'banUser':
        await userRef.update({
          isBanned: true,
          lastUpdated: new Date().toISOString()
        });
        break;

      case 'unbanUser':
        await userRef.update({
          isBanned: false,
          lastUpdated: new Date().toISOString()
        });
        break;

      case 'deleteUser':
        try {
          // Try to delete from Auth first
          await adminAuth.deleteUser(userId);
        } catch (authError) {
          console.warn('Auth deletion failed, proceeding with Firestore deletion:', authError.message);
        }
        // Delete from Firestore
        await userRef.delete();
        break;

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 