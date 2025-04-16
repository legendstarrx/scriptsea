import { adminDb } from '../../../lib/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { status, tx_ref, transaction_id } = req.query;

    if (status === 'successful') {
      // Verify the transaction with Flutterwave
      const verifyResponse = await fetch(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.FLW_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await verifyResponse.json();

      if (data.status === 'success') {
        // Get user details from meta data
        const userId = data.data.meta.userId;
        const planType = data.data.meta.plan_type;

        // Update user subscription in Firestore
        const userRef = adminDb.collection('users').doc(userId);
        
        // Calculate subscription end date properly
        const now = new Date();
        const subscriptionEnd = new Date(now);
        if (planType === 'yearly') {
          subscriptionEnd.setFullYear(now.getFullYear() + 1);
        } else {
          subscriptionEnd.setMonth(now.getMonth() + 1);
        }

        // Update user document with all necessary fields
        await userRef.update({
          subscription: 'pro',
          subscriptionType: planType,
          scriptsRemaining: 100,
          scriptsLimit: 100,
          subscriptionEnd: subscriptionEnd.toISOString(),
          lastPayment: new Date().toISOString(),
          paymentAmount: data.data.amount,
          paymentCurrency: data.data.currency,
          paid: true,
          upgradedAt: new Date().toISOString(),
          nextBillingDate: subscriptionEnd.toISOString()
        });

        // Log payment
        await adminDb.collection('payments').add({
          userId,
          email: data.data.customer.email,
          amount: data.data.amount,
          status: 'successful',
          type: planType,
          date: new Date(),
          reference: tx_ref,
          transactionId: transaction_id,
          currency: data.data.currency,
          paymentMethod: data.data.payment_type,
          ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress
        });

        return res.redirect(302, `${process.env.NEXT_PUBLIC_BASE_URL}/generate?payment=success`);
      }
    }

    return res.redirect(302, `${process.env.NEXT_PUBLIC_BASE_URL}/generate?payment=failed`);
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.redirect(302, `${process.env.NEXT_PUBLIC_BASE_URL}/generate?payment=failed`);
  }
} 