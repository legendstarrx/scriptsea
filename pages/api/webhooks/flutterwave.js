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
    // Verify webhook signature
    const signature = req.headers['verif-hash'];
    if (!signature || signature !== WEBHOOK_HASH) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ message: 'Invalid signature' });
    }

    const event = req.body;
    console.log('Received webhook event:', event.event);

    // Handle successful payment
    if (event.event === 'charge.completed') {
      const { customer, amount, currency, tx_ref } = event.data;
      
      // Extract user email from tx_ref
      const userEmail = tx_ref.split('_')[1];
      
      // Verify transaction with FlutterWave
      const verifyResponse = await fetch(
        `https://api.flutterwave.com/v3/transactions/${event.data.id}/verify`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const verification = await verifyResponse.json();
      
      if (verification.status === 'success' && verification.data.status === 'successful') {
        // Determine subscription type based on amount
        const isYearlyPlan = amount === 4999; // $49.99
        const isMonthlyPlan = amount === 499;  // $4.99

        if (isMonthlyPlan || isYearlyPlan) {
          // Update user subscription in Firestore
          const usersRef = collection(db, 'users');
          const userDoc = doc(usersRef, userEmail);

          await updateDoc(userDoc, {
            subscription: 'pro',
            scriptsRemaining: 100,
            subscriptionEnd: new Date(Date.now() + (isYearlyPlan ? 365 : 30) * 24 * 60 * 60 * 1000),
            lastPayment: new Date(),
            paymentAmount: amount,
            paymentCurrency: currency,
            subscriptionType: isYearlyPlan ? 'yearly' : 'monthly'
          });

          // Log payment
          const paymentsRef = collection(db, 'payments');
          await addDoc(paymentsRef, {
            userId: userEmail,
            userEmail: userEmail,
            amount: amount,
            currency: currency,
            status: 'successful',
            type: isYearlyPlan ? 'yearly' : 'monthly',
            transactionId: event.data.id,
            transactionRef: tx_ref,
            date: new Date(),
            paymentMethod: event.data.payment_type,
            verificationResponse: verification.data
          });
        }
      }
    }

    // Handle failed payment
    if (event.event === 'charge.completed' && event.data.status === 'failed') {
      const { customer, amount, currency } = event.data;
      
      // Log failed payment
      const paymentsRef = collection(db, 'payments');
      await addDoc(paymentsRef, {
        userId: customer.email,
        userEmail: customer.email,
        amount: amount,
        currency: currency,
        status: 'failed',
        type: amount === 4999 ? 'yearly' : 'monthly',
        transactionId: event.data.id,
        transactionRef: event.data.tx_ref,
        date: new Date(),
        paymentMethod: event.data.payment_type,
        failureReason: event.data.processor_response
      });
    }

    // Always return 200 for webhook
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    // Still return 200 to acknowledge receipt
    return res.status(200).json({ received: true, error: error.message });
  }
} 