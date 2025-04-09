import { db } from '../../../lib/firebase';
import { doc, updateDoc, collection, addDoc } from 'firebase/firestore';

// Load environment variables
const WEBHOOK_HASH = process.env.FLUTTERWAVE_WEBHOOK_HASH;
const TEST_SECRET_KEY = process.env.FLUTTERWAVE_TEST_SECRET_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const signature = req.headers['verif-hash'];
    if (!signature || signature !== process.env.FLUTTERWAVE_WEBHOOK_HASH) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    const event = req.body;
    
    if (event.event === 'subscription.created' || event.event === 'charge.completed') {
      const { customer, amount, currency } = event.data;
      
      // Verify transaction
      const verification = await fetch(
        `https://api.flutterwave.com/v3/transactions/${event.data.id}/verify`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const verifyData = await verification.json();
      
      if (verifyData.status === 'success') {
        const isYearlyPlan = amount === 49.99;
        
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
          subscriptionId: event.data.payment_plan || null
        });

        // Log payment
        await addDoc(collection(db, 'payments'), {
          userId: customer.email,
          userEmail: customer.email,
          amount: amount,
          currency: currency,
          status: 'successful',
          type: isYearlyPlan ? 'yearly' : 'monthly',
          transactionId: event.data.id,
          subscriptionId: event.data.payment_plan || null,
          date: new Date(),
          paymentMethod: event.data.payment_type
        });
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ message: 'Error processing webhook' });
  }
} 