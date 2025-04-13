import { adminDb, adminAuth } from '../../../lib/firebaseAdmin';

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

    switch (action) {
      case 'updateSubscription':
        if (!userId || !data?.plan) {
          return res.status(400).json({ error: 'Missing required fields' });
        }
        
        await adminDb.collection('users').doc(userId).update({
          subscription: data.plan,
          scriptsRemaining: data.plan === 'pro' ? 100 : 3,
          lastUpdated: new Date().toISOString()
        });
        break;

      case 'banUser':
        if (!userId) {
          return res.status(400).json({ error: 'User ID is required' });
        }
        
        await adminDb.collection('users').doc(userId).update({
          isBanned: true,
          lastUpdated: new Date().toISOString()
        });
        break;

      case 'unbanUser':
        if (!userId) {
          return res.status(400).json({ error: 'User ID is required' });
        }
        
        await adminDb.collection('users').doc(userId).update({
          isBanned: false,
          lastUpdated: new Date().toISOString()
        });
        break;

      case 'deleteUser':
        if (!userId) {
          return res.status(400).json({ error: 'User ID is required' });
        }
        
        try {
          await adminAuth.deleteUser(userId);
        } catch (authError) {
          console.warn('Auth deletion failed:', authError.message);
        }
        await adminDb.collection('users').doc(userId).delete();
        break;

      case 'deleteByIP':
        if (!data?.ipAddress) {
          return res.status(400).json({ error: 'IP address is required' });
        }
        
        const snapshot = await adminDb.collection('users')
          .where('ipAddress', '==', data.ipAddress)
          .get();
        
        const deletePromises = snapshot.docs.map(async (doc) => {
          try {
            await adminAuth.deleteUser(doc.id);
          } catch (authError) {
            console.warn('Auth deletion failed:', authError.message);
          }
          return doc.ref.delete();
        });
        
        await Promise.all(deletePromises);
        break;

      case 'banByIP':
        if (!data?.ipAddress) {
          return res.status(400).json({ error: 'IP address is required' });
        }
        
        const banSnapshot = await adminDb.collection('users')
          .where('ipAddress', '==', data.ipAddress)
          .get();
        
        const banPromises = banSnapshot.docs.map(doc => 
          doc.ref.update({
            isBanned: true,
            lastUpdated: new Date().toISOString(),
            banReason: `Banned by IP address: ${data.ipAddress}`
          })
        );
        
        await Promise.all(banPromises);
        break;

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 