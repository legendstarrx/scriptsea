import { db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import crypto from 'crypto';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get the signature from the headers
    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');

    // Verify signature
    if (hash !== req.headers['x-paystack-signature']) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ message: 'Invalid signature' });
    }

    const event = req.body;

    // Handle subscription events
    switch (event.event) {
      case 'subscription.create':
        const { customer, plan, subscription_code, next_payment_date } = event.data;
        
        // Update user subscription in Firebase
        const userRef = doc(db, 'users', customer.email);
        await updateDoc(userRef, {
          subscription: plan.interval === 'monthly' ? 'monthly' : 'yearly',
          paid: true,
          lastPayment: new Date().toISOString(),
          nextPaymentDate: new Date(next_payment_date).toISOString(),
          subscriptionId: subscription_code,
          scriptsRemaining: 100
        });
        break;

      case 'subscription.disable':
        const disabledUserRef = doc(db, 'users', event.data.customer.email);
        await updateDoc(disabledUserRef, {
          subscription: 'free',
          paid: false,
          scriptsRemaining: 3
        });
        break;

      case 'charge.success':
        // Handle successful charges (renewals)
        const chargeUserRef = doc(db, 'users', event.data.customer.email);
        await updateDoc(chargeUserRef, {
          lastPayment: new Date().toISOString(),
          scriptsRemaining: 100
        });
        break;
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ message: 'Error processing webhook' });
  }
}