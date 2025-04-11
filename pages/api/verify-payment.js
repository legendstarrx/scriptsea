import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import axios from 'axios';
import { adminDb } from '../../lib/firebaseAdmin';

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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { reference, plan, userId } = req.body;

  if (!reference || !plan || !userId) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required parameters' 
    });
  }

  try {
    // Verify with Paystack
    const verifyResponse = await axios({
      method: 'get',
      url: `https://api.paystack.co/transaction/verify/${reference}`,
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Cache-Control': 'no-store'
      }
    });

    const { data } = verifyResponse.data;

    if (data.status === 'success') {
      // Update user subscription
      const userRef = adminDb.collection('users').doc(userId);
      await userRef.update({
        subscription: 'pro',
        scriptsRemaining: 100,
        subscriptionEnd: new Date(Date.now() + (plan === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000),
        lastPayment: new Date().toISOString(),
        paymentAmount: data.amount / 100,
        paymentCurrency: 'NGN',
        subscriptionType: plan,
        paid: true,
        subscriptionId: data.authorization.authorization_code,
        upgradedAt: new Date().toISOString(),
        nextBillingDate: new Date(Date.now() + (plan === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString()
      });

      // Log payment
      await adminDb.collection('payments').add({
        userId,
        email: data.customer.email,
        amount: data.amount,
        status: 'successful',
        type: plan,
        date: new Date(),
        reference: reference
      });

      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment verification failed' 
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during verification' 
    });
  }
} 