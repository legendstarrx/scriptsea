import { adminDb } from '../../../lib/firebaseAdmin';
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check admin authorization
    const adminEmail = req.headers['x-admin-email'];
    if (adminEmail !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const usersSnapshot = await adminDb.collection('users').get();
    const users = [];

    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      
      // Check if IP is banned
      let isBanned = false;
      if (userData.ipAddress) {
        const bannedIpDoc = await adminDb.collection('banned_ips').doc(userData.ipAddress).get();
        isBanned = bannedIpDoc.exists;
      }
      
      users.push({
        id: doc.id,
        ...userData,
        isBanned
      });
    }

    return res.status(200).json({ users: users || [] });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch users',
      details: error.message 
    });
  }
} 
 
 