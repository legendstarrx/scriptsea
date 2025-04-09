import { db } from '../../../lib/firebase';
import { doc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { getIP } from '../../../utils/request';

// Load environment variables
const WEBHOOK_HASH = process.env.FLUTTERWAVE_WEBHOOK_HASH;
const TEST_SECRET_KEY = process.env.FLUTTERWAVE_TEST_SECRET_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get client IP for logging
    const clientIP = getIP(req);

    // Verify webhook signature without exposing the secret
    const signature = req.headers['verif-hash'];
    if (!signature || signature !== process.env.FLW_WEBHOOK_SECRET) {
      console.warn(`Unauthorized webhook attempt from IP: ${clientIP}`);
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { customer, amount, currency, status } = req.body.data;
    
    if (status === 'successful') {
      // Log successful webhook with IP
      console.log(`Processing successful payment webhook from IP: ${clientIP}`);
      
      // Verify transaction with FlutterWave
      const verifyResponse = await fetch(
        `https://api.flutterwave.com/v3/transactions/${req.body.data.id}/verify`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const verification = await verifyResponse.json();
      
      if (verification.status === 'success') {
        // Update user subscription
        const usersRef = collection(db, 'users');
        const userDoc = doc(usersRef, customer.email);

        await updateDoc(userDoc, {
          subscription: 'pro',
          scriptsRemaining: 100,
          subscriptionEnd: new Date(Date.now() + (amount === 4999 ? 365 : 30) * 24 * 60 * 60 * 1000),
          lastPayment: new Date(),
          paymentAmount: amount,
          paymentCurrency: currency,
          lastWebhookIP: clientIP,
          lastWebhookDate: new Date()
        });

        return res.status(200).json({ message: 'Webhook processed successfully' });
      }
    }

    return res.status(200).json({ message: 'Webhook received' });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 