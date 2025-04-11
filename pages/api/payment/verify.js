import { db } from '../../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { reference } = req.query; // Paystack sends 'reference' instead of 'transaction_id'

  if (!reference) {
    return res.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/generate?payment=failed`);
  }

  try {
    // Verify transaction with Paystack
    const verifyResponse = await axios({
      method: 'get',
      url: `https://api.paystack.co/transaction/verify/${reference}`,
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    });

    console.log('Paystack verification response:', verifyResponse.data);
    const { data } = verifyResponse.data;

    if (data.status === 'success') {
      console.log('Payment successful, updating user:', data.metadata.userId);
      // Get user ID from metadata
      const userId = data.metadata.userId;
      const planType = data.metadata.plan_type;
      
      // Update user's subscription in Firestore
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        subscription: 'pro',
        scriptsRemaining: 100,
        subscriptionEnd: new Date(Date.now() + (planType === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000),
        lastPayment: new Date().toISOString(),
        paymentAmount: data.amount / 100, // Convert from kobo to naira
        paymentCurrency: 'NGN',
        subscriptionType: planType,
        paid: true,
        subscriptionId: data.authorization.authorization_code
      });

      // Redirect to generate page with success message
      return res.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/generate?payment=success`);
    } else {
      return res.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/generate?payment=failed`);
    }
  } catch (error) {
    console.error('Payment verification error details:', {
      error: error.message,
      response: error.response?.data,
      reference: reference
    });
    // Always redirect to generate page
    return res.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/generate?payment=error`);
  }
} 