import { db } from '../../../lib/firebase';
import { collection, doc, updateDoc, addDoc } from 'firebase/firestore';
import crypto from 'crypto';

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
      // Verify the transaction
      const verifyResponse = await fetch(
        `https://api.flutterwave.com/v3/transactions/${event.data.id}/verify`,
        {
          headers: {
            Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
          }
        }
      );

      const verifyData = await verifyResponse.json();
      
      if (verifyData.status === 'success' && verifyData.data.status === 'successful') {
        const { customer, amount, currency } = event.data;
        const planType = event.data.meta.plan_type;
        const isYearlyPlan = planType === 'yearly';
        const userEmail = event.data.meta.user_email;

        // Update user subscription
        const userRef = doc(db, 'users', userEmail);
        await updateDoc(userRef, {
          subscription: 'pro',
          scriptsRemaining: isYearlyPlan ? 1200 : 100,
          scriptsLimit: isYearlyPlan ? 1200 : 100,
          subscriptionEnd: new Date(Date.now() + (isYearlyPlan ? 365 : 30) * 24 * 60 * 60 * 1000),
          lastPayment: new Date(),
          paymentAmount: amount,
          paymentCurrency: currency,
          subscriptionType: isYearlyPlan ? 'yearly' : 'monthly',
          transactionId: event.data.id
        });

        // Log payment
        await addDoc(collection(db, 'payments'), {
          userId: userEmail,
          userEmail: userEmail,
          amount: amount,
          currency: currency,
          status: 'successful',
          type: isYearlyPlan ? 'yearly' : 'monthly',
          transactionId: event.data.id,
          transactionRef: event.data.tx_ref,
          date: new Date(),
          paymentMethod: event.data.payment_type
        });

        return res.status(200).json({ success: true });
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ message: 'Error processing webhook' });
  }
} 