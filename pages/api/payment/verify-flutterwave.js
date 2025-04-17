import { adminDb } from '../../../lib/firebaseAdmin';

export default async function handler(req, res) {
  const { transaction_id, tx_ref } = req.query;

  try {
    // Verify the transaction
    const response = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.FLW_SECRET_KEY}`
        }
      }
    );

    const data = await response.json();

    if (data.status === 'success' && data.data.status === 'successful') {
      const { customer, amount, tx_ref } = data.data;
      const { userId, plan_type } = data.data.meta;
      
      // Update user subscription
      const userRef = adminDb.collection('users').doc(userId);
      await userRef.update({
        subscription: 'pro',
        scriptsRemaining: plan_type === 'yearly' ? 1200 : 100,
        scriptsLimit: plan_type === 'yearly' ? 1200 : 100,
        subscriptionEnd: new Date(Date.now() + (plan_type === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000),
        lastPayment: new Date().toISOString(),
        paymentAmount: amount,
        subscriptionType: plan_type,
        paid: true,
        subscriptionId: tx_ref,
        nextBillingDate: new Date(Date.now() + (plan_type === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString()
      });

      // Log payment
      await adminDb.collection('payments').add({
        userId,
        email: customer.email,
        amount,
        status: 'successful',
        type: plan_type,
        date: new Date(),
        reference: tx_ref,
        ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        transactionId: transaction_id
      });

      return res.redirect(302, `${process.env.NEXT_PUBLIC_BASE_URL}/generate?payment=success`);
    } else {
      // Log failed payment
      await adminDb.collection('payments').add({
        status: 'failed',
        date: new Date(),
        reference: tx_ref,
        ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        error: data.message
      });

      return res.redirect(302, `${process.env.NEXT_PUBLIC_BASE_URL}/generate?payment=failed`);
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.redirect(302, `${process.env.NEXT_PUBLIC_BASE_URL}/generate?payment=failed`);
  }
} 