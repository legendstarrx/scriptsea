import { db } from '../../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { validateAdminRequest } from '../../../lib/adminAuth';

export default async function handler(req, res) {
  try {
    // Validate admin access
    await validateAdminRequest(req);
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized access' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userEmail, plan } = req.body;

    const subscriptionEnd = new Date();
    if (plan === 'yearly') {
      subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
    } else {
      subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
    }

    const userRef = doc(db, 'users', userEmail);
    await updateDoc(userRef, {
      subscription: 'pro',
      scriptsRemaining: 100,
      subscriptionEnd: subscriptionEnd.toISOString(),
      lastPayment: new Date().toISOString(),
      subscriptionType: plan
    });

    return res.status(200).json({ message: 'Subscription manually updated' });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return res.status(500).json({ error: 'Failed to update subscription' });
  }
} 