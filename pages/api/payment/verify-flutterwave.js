import { adminDb } from '../../../lib/firebaseAdmin';
import * as admin from 'firebase-admin';
import * as flw from 'flutterwave-node';

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
      // Update Firestore with new subscription details
      const db = admin.firestore();
      await db.collection('users').doc(req.query.userId).update({
        subscription: 'pro',
        subscriptionType: req.query.plan, // 'monthly' or 'yearly'
        subscriptionEnd: calculateEndDate(req.query.plan),
        scriptsRemaining: 100,
        scriptsLimit: 100,
        paid: true,
        lastPayment: admin.firestore.FieldValue.serverTimestamp()
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

function calculateEndDate(plan) {
  const now = new Date();
  const subscriptionEnd = new Date(now);
  
  if (plan === 'yearly') {
    subscriptionEnd.setFullYear(now.getFullYear() + 1);
  } else {
    subscriptionEnd.setMonth(now.getMonth() + 1);
  }

  return subscriptionEnd.toISOString();
} 