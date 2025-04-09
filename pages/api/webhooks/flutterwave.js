import { db } from '../../../lib/firebase';
import { collection, doc, updateDoc, addDoc } from 'firebase/firestore';

// Load environment variables
const WEBHOOK_HASH = process.env.FLUTTERWAVE_WEBHOOK_HASH;
const TEST_SECRET_KEY = process.env.FLUTTERWAVE_TEST_SECRET_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify webhook signature
    const signature = req.headers['verif-hash'];
    if (signature !== process.env.FLUTTERWAVE_WEBHOOK_HASH) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    const event = req.body;
    
    if (event.event === 'charge.completed' && event.data.status === 'successful') {
      const { customer, amount, currency, tx_ref, id: transactionId } = event.data;
      const planType = event.data.meta.plan_type;
      const isYearlyPlan = planType === 'yearly';

      // Update user subscription
      const userRef = doc(db, 'users', customer.email);
      await updateDoc(userRef, {
        subscription: 'pro',
        scriptsRemaining: 100,
        subscriptionEnd: new Date(Date.now() + (isYearlyPlan ? 365 : 30) * 24 * 60 * 60 * 1000),
        lastPayment: new Date(),
        paymentAmount: amount,
        paymentCurrency: currency,
        subscriptionType: isYearlyPlan ? 'yearly' : 'monthly',
        transactionId: transactionId
      });

      // Log payment
      await addDoc(collection(db, 'payments'), {
        userId: customer.email,
        userEmail: customer.email,
        amount: amount,
        currency: currency,
        status: 'successful',
        type: isYearlyPlan ? 'yearly' : 'monthly',
        transactionId: transactionId,
        transactionRef: tx_ref,
        date: new Date(),
        paymentMethod: event.data.payment_type
      });

      return res.status(200).json({ success: true });
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ message: 'Error processing webhook' });
  }
} 