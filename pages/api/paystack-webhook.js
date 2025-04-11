import { db } from '../../lib/firebase';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import crypto from 'crypto';

async function getUserByEmail(email) {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.where('email', '==', email).limit(1).get();
  return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify webhook signature
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    const event = req.body;

    switch (event.event) {
      case 'subscription.create':
        const { customer, plan, subscription_code, next_payment_date } = event.data;
        
        // Get user document by email
        const user = await getUserByEmail(customer.email);
        if (!user) {
          console.error('User not found:', customer.email);
          return res.status(404).json({ error: 'User not found' });
        }

        // Update user using their UID
        const userRef = doc(db, 'users', user.id);
        await updateDoc(userRef, {
          subscription: plan.interval === 'monthly' ? 'monthly' : 'yearly',
          paid: true,
          lastPayment: new Date().toISOString(),
          nextPaymentDate: new Date(next_payment_date).toISOString(),
          subscriptionId: subscription_code,
          scriptsRemaining: 100
        });

        // Log payment
        await addDoc(collection(db, 'payments'), {
          userEmail: customer.email,
          amount: plan.amount,
          status: 'successful',
          type: plan.interval,
          date: new Date(),
          subscriptionId: subscription_code
        });
        break;

      case 'subscription.disable':
        await updateDoc(doc(db, 'users', event.data.customer.email), {
          subscription: 'free',
          paid: false,
          scriptsRemaining: 3
        });
        break;

      case 'charge.success':
        await updateDoc(doc(db, 'users', event.data.customer.email), {
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