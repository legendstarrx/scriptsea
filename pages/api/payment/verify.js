import { db } from '../../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { status, tx_ref, transaction_id } = req.query;

  if (status === 'successful') {
    try {
      // Verify transaction with FlutterWave
      const verifyResponse = await fetch(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, {
        headers: {
          'Authorization': `Bearer ${process.env.FLW_SECRET_KEY}`
        }
      });

      const verifyData = await verifyResponse.json();

      if (verifyData.status === 'success' && verifyData.data.status === 'successful') {
        // Update user's subscription in Firestore
        const userRef = doc(db, 'users', tx_ref.split('-')[0]);
        const isYearlyPlan = verifyData.data.amount === 4999;
        
        await updateDoc(userRef, {
          subscription: 'pro',
          scriptsRemaining: 100,
          subscriptionEnd: new Date(Date.now() + (isYearlyPlan ? 365 : 30) * 24 * 60 * 60 * 1000),
          lastPayment: new Date(),
          paymentAmount: verifyData.data.amount,
          paymentCurrency: verifyData.data.currency,
          subscriptionType: isYearlyPlan ? 'yearly' : 'monthly'
        });

        // Redirect to success page
        res.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?payment=success`);
      } else {
        res.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?payment=failed`);
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      res.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?payment=error`);
    }
  } else {
    res.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?payment=cancelled`);
  }
} 