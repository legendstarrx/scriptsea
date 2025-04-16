import { adminDb } from '../../../lib/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { status, tx_ref, transaction_id } = req.query;

    if (status === 'successful') {
      // Verify the transaction with Flutterwave
      const response = await fetch(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.FLW_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.status === 'success' && data.data.status === 'successful') {
        const userId = data.data.meta.userId;
        const planType = data.data.meta.plan_type;
        
        // Calculate subscription end date
        const subscriptionEnd = new Date();
        if (planType === 'yearly') {
          subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
        } else {
          subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
        }

        // Update user subscription
        const userRef = adminDb.collection('users').doc(userId);
        await userRef.update({
          subscription: 'pro',
          scriptsRemaining: 100,
          scriptsLimit: 100,
          subscriptionEnd: subscriptionEnd.toISOString(),
          lastPayment: new Date().toISOString(),
          paymentAmount: data.data.amount,
          paymentCurrency: data.data.currency,
          subscriptionType: planType,
          paid: true,
          upgradedAt: new Date().toISOString()
        });

        // Log payment in payments collection
        await adminDb.collection('payments').add({
          userId,
          email: data.data.customer.email,
          amount: data.data.amount,
          currency: data.data.currency,
          status: 'successful',
          type: planType,
          date: new Date().toISOString(),
          reference: tx_ref,
          transactionId: transaction_id,
          paymentMethod: data.data.payment_type,
          customerName: data.data.customer.name,
          customerEmail: data.data.customer.email,
          ipAddress: data.data.ip
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