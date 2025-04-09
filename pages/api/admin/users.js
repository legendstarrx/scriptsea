import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  try {
    console.log('Initializing Firebase Admin...');
    console.log('Project ID:', process.env.FIREBASE_PROJECT_ID ? 'present' : 'missing');
    console.log('Client Email:', process.env.FIREBASE_CLIENT_EMAIL ? 'present' : 'missing');
    console.log('Private Key:', process.env.FIREBASE_PRIVATE_KEY ? 'present' : 'missing');

    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      })
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    throw error;
  }
}

const db = getFirestore();
const auth = getAuth();

export default async function handler(req, res) {
  // Verify admin API key
  if (req.headers.authorization !== process.env.NEXT_PUBLIC_ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const usersSnapshot = await db.collection('users').get();
      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { userId, action, data } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const userRef = db.collection('users').doc(userId);
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
            await auth.deleteUser(userId);
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
      console.error('Error performing action:', error);
      return res.status(500).json({ error: error.message || 'Failed to perform action' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 