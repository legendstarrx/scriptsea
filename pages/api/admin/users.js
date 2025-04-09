import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { validateAdminRequest } from './middleware';
import { withRateLimit } from './rate-limit';

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

const handler = async (req, res) => {
  try {
    await validateAdminRequest(req);
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized access' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default withRateLimit(handler); 