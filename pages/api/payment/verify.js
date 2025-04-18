import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import axios from 'axios';

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    })
  });
}

const adminDb = getFirestore();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { reference } = req.query;

  if (!reference) {
    console.error('No reference provided');
    return res.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/generate?payment=failed`);
  }

  try {
    console.log('Verifying payment reference:', reference);
    
    const verifyResponse = await axios({
      method: 'get',
      url: `https://api.paystack.co/transaction/verify/${reference}`,
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Cache-Control': 'no-store'
      }
    });

    console.log('Paystack response:', verifyResponse.data);
    const { data } = verifyResponse.data;

    if (data.status === 'success') {
      const userId = data.metadata.userId;
      const planType = data.metadata.plan_type;
      
      console.log('Updating subscription for user:', userId);

      // Use admin SDK for Firestore operations
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

      // Log payment
      await adminDb.collection('payments').add({
        userId,
        email: data.customer.email,
        amount: data.amount,
        status: 'successful',
        type: planType,
        date: new Date(),
        reference: reference
      });

      console.log('Subscription updated successfully');
      
      // Set headers to prevent caching
      res.setHeader('Cache-Control', 'no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      return res.redirect(302, `${process.env.NEXT_PUBLIC_BASE_URL}/generate?payment=success`);
    } else {
      console.error('Payment not successful:', data);
      return res.redirect(302, `${process.env.NEXT_PUBLIC_BASE_URL}/generate?payment=failed`);
    }
  } catch (error) {
    console.error('Payment verification error:', error.response?.data || error.message);
    return res.redirect(302, `${process.env.NEXT_PUBLIC_BASE_URL}/generate?payment=error`);
  }
} 