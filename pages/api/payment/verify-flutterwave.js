import Flutterwave from 'flutterwave-node-v3';
import { adminDb } from '../../../lib/firebaseAdmin';

const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify the payment with Flutterwave
    const transaction = await flw.Transaction.verify({
      id: req.query.transaction_id
    });

    if (transaction.data.status === "successful") {
      const plan = req.query.plan; // 'monthly' or 'yearly'
      const now = new Date();
      const subscriptionEnd = new Date(now);
      
      if (plan === 'yearly') {
        subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
      } else {
        subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
      }

      await adminDb.collection('users').doc(req.query.userId).update({
        subscription: 'pro',
        subscriptionType: plan,
        scriptsRemaining: 100,
        scriptsLimit: 100,
        subscriptionEnd: subscriptionEnd.toISOString(),
        paid: true,
        lastPayment: admin.firestore.FieldValue.serverTimestamp(),
        upgradedAt: admin.firestore.FieldValue.serverTimestamp(),
        nextBillingDate: subscriptionEnd.toISOString()
      });

      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json({ error: 'Payment verification failed' });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 