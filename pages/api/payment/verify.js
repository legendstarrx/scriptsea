import { adminDb } from '../../../lib/firebase-admin';
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { reference } = req.query;

  if (!reference) {
    return res.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/generate?payment=failed`);
  }

  try {
    // Verify transaction with Paystack
    const verifyResponse = await axios({
      method: 'get',
      url: `https://api.paystack.co/transaction/verify/${reference}`,
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Cache-Control': 'no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });

    console.log('Paystack verification response:', verifyResponse.data);
    const { data } = verifyResponse.data;

    if (data.status === 'success') {
      // Get user ID from metadata
      const userId = data.metadata.userId;
      const planType = data.metadata.plan_type;
      
      // Update user's subscription using admin SDK
      const userRef = adminDb.collection('users').doc(userId);
      await userRef.update({
        subscription: 'pro',
        scriptsRemaining: 100,
        subscriptionEnd: new Date(Date.now() + (planType === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000),
        lastPayment: new Date().toISOString(),
        paymentAmount: data.amount / 100,
        paymentCurrency: 'NGN',
        subscriptionType: planType,
        paid: true,
        subscriptionId: data.authorization.authorization_code
      });

      // Log payment using admin SDK
      await adminDb.collection('payments').add({
        userId,
        amount: data.amount,
        status: 'successful',
        type: planType,
        date: new Date(),
        reference: reference,
        email: data.customer.email
      });

      return res.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/generate?payment=success`);
    } else {
      return res.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/generate?payment=failed`);
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/generate?payment=error`);
  }
} 