import { adminDb } from '../../../lib/firebaseAdmin';

export default async function handler(req, res) {
  // Verify admin authorization for all requests
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.NEXT_PUBLIC_ADMIN_API_KEY}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const usersSnapshot = await adminDb.collection('users').get();
      const users = usersSnapshot.docs.map(doc => {
        const data = doc.data();
        let daysLeft = 'N/A';
        
        if (data.subscriptionEnd) {
          try {
            const endDate = new Date(data.subscriptionEnd);
            const now = new Date();
            if (!isNaN(endDate.getTime())) {
              daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
            }
          } catch (error) {
            console.error('Error calculating days left:', error);
          }
        }

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

  if (req.method === 'POST') {
    try {
      const { userId, action, plan, data } = req.body;
      const userRef = adminDb.collection('users').doc(userId);
      
      switch (action) {
        case 'updateSubscription':
          const now = new Date();
          const subscriptionEnd = new Date(now);
          
          let updateData = {};
          
          if (plan === 'free') {
            updateData = {
              subscription: 'free',
              subscriptionType: 'free',
              scriptsRemaining: 3,
              scriptsLimit: 3,
              subscriptionEnd: null,
              paid: false
            };
          } else {
            subscriptionEnd.setMonth(subscriptionEnd.getMonth() + (plan === 'yearly' ? 12 : 1));
            updateData = {
              subscription: 'pro',
              subscriptionType: plan,
              scriptsRemaining: 100,
              scriptsLimit: 100,
              subscriptionEnd: subscriptionEnd.toISOString(),
              paid: true,
              upgradedAt: now.toISOString(),
              lastPayment: now.toISOString()
            };
          }
          await userRef.update(updateData);
          break;

        case 'banUser':
          await userRef.update({
            isBanned: true,
            bannedAt: new Date().toISOString()
          });
          break;

        case 'unbanUser':
          await userRef.update({
            isBanned: false,
            bannedAt: null
          });
          break;

        case 'deleteUser':
          await userRef.delete();
          break;

        case 'banByIP':
          const { ipAddress } = data;
          const usersSnapshot = await adminDb.collection('users')
            .where('ipAddress', '==', ipAddress)
            .get();
          
          const batch = adminDb.batch();
          usersSnapshot.docs.forEach(doc => {
            batch.update(doc.ref, {
              isBanned: true,
              bannedAt: new Date().toISOString()
            });
          });
          await batch.commit();
          break;

        default:
          return res.status(400).json({ error: 'Invalid action' });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error processing action:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 