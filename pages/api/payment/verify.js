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
          'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
        }
      });

      const verifyData = await verifyResponse.json();

      if (verifyData.status === 'success' && verifyData.data.status === 'successful') {
        // Update user's subscription in Firestore
        const userRef = doc(db, 'users', tx_ref.split('-')[0]); // Extract user ID from tx_ref
        await updateDoc(userRef, {
          subscription: 'pro',
          subscriptionType: verifyData.data.amount === 499 ? 'monthly' : 'yearly',
          scriptsRemaining: 100,
          subscriptionEnd: new Date(Date.now() + (verifyData.data.amount === 499 ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString(),
          lastPayment: new Date().toISOString(),
          paymentAmount: verifyData.data.amount,
          paymentCurrency: verifyData.data.currency
        });

        // Redirect to success page
        res.redirect('https://scriptsea.com/dashboard?payment=success');
      } else {
        res.redirect('https://scriptsea.com/dashboard?payment=failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      res.redirect('https://scriptsea.com/dashboard?payment=error');
    }
  } else {
    res.redirect('https://scriptsea.com/dashboard?payment=cancelled');
  }
} 