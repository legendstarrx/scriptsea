import { adminDb, verifyAdmin } from '../../../lib/firebaseAdmin';

export default async function handler(req, res) {
  try {
    await verifyAdmin(req);

    const usersSnapshot = await adminDb.collection('users').get();
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json({ users });
  } catch (error) {
    console.error('Admin API Error:', error);
    res.status(403).json({ error: 'Unauthorized or failed to get users' });
  }
} 