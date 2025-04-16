import { adminDb, verifyAdmin } from '../../../lib/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await verifyAdmin(req);

    const usersSnapshot = await adminDb.collection('users').get();
    const users = [];

    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      
      // Check if IP is banned
      const bannedIpDoc = await adminDb.collection('banned_ips').doc(userData.ipAddress).get();
      
      users.push({
        id: doc.id,
        ...userData,
        isBanned: bannedIpDoc.exists
      });
    }

    return res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: error.message });
  }
} 