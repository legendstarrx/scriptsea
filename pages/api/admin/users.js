import { adminDb } from '../../../lib/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Update the authorization check to match the Bearer format
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.NEXT_PUBLIC_ADMIN_API_KEY}`) {
    console.log('Auth failed:', { 
      received: authHeader,
      expected: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_API_KEY}`
    });
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const usersSnapshot = await adminDb.collection('users').get();
    const users = usersSnapshot.docs.map(doc => {
      const data = doc.data();
      const daysLeft = data.subscriptionEnd 
        ? Math.ceil((new Date(data.subscriptionEnd) - new Date()) / (1000 * 60 * 60 * 24))
        : 'N/A';

      return {
        id: doc.id,
        email: data.email,
        displayName: data.displayName,
        ipAddress: data.ipAddress,
        subscription: data.subscription || 'free',
        subscriptionType: data.subscriptionType || 'free',
        subscriptionEnd: data.subscriptionEnd,
        scriptsRemaining: data.scriptsRemaining || 0,
        scriptsLimit: data.subscription === 'pro' ? 100 : 3,
        daysLeft: daysLeft
      };
    });

    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
} 