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
        const userRef = doc(db, 'users', tx_ref.split('-')[0]); // Extract user ID from tx_ref
        await updateDoc(userRef, {
          subscription: verifyData.data.amount === 499 ? 'pro-monthly' : 'pro-yearly',
          subscriptionEndDate: new Date(Date.now() + (verifyData.data.amount === 499 ? 30 : 365) * 24 * 60 * 60 * 1000)
        });

        // Update redirect URL to use scriptsea.com
        res.redirect('https://www.scriptsea.com/dashboard?payment=success');
      } else {
        res.redirect('https://www.scriptsea.com/dashboard?payment=failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      res.redirect('https://www.scriptsea.com/dashboard?payment=error');
    }
  } else {
    res.redirect('https://www.scriptsea.com/dashboard?payment=cancelled');
  }
} 