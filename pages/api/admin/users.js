import { adminDb } from '../../../lib/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { userId, action, plan } = req.body;
      
      if (action === 'updateSubscription') {
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
          // For pro plans (monthly or yearly)
          if (plan === 'yearly') {
            subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
          } else {
            subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
          }

          updateData = {
            subscription: 'pro',
            subscriptionType: plan,
            scriptsRemaining: 100,
            scriptsLimit: 100,
            subscriptionEnd: subscriptionEnd.toISOString(),
            paid: true,
            upgradedAt: now.toISOString(),
            lastPayment: now.toISOString(),
            nextBillingDate: subscriptionEnd.toISOString()
          };
        }

        await adminDb.collection('users').doc(userId).update(updateData);
        return res.status(200).json({ success: true });
      }
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Failed to update subscription' });
    }
  }

  // GET request to fetch users
  try {
    const usersSnapshot = await adminDb.collection('users').get();
    const users = usersSnapshot.docs.map(doc => {
      const data = doc.data();
      let daysLeft = 0;
      
      if (data.subscriptionEnd) {
        const endDate = new Date(data.subscriptionEnd);
        const now = new Date();
        daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
      }

      return {
        id: doc.id,
        ...data,
        daysLeft: data.subscription === 'free' ? 'N/A' : daysLeft
      };
    });

    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
} 