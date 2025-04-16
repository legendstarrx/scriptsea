import Flutterwave from 'flutterwave-node-v3';
import { adminDb } from '../../../lib/firebaseAdmin';

const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { status, transaction_id, tx_ref, userId, plan } = req.query;

  console.log('Received verification request:', { status, transaction_id, tx_ref, userId, plan });

  if (!transaction_id || !userId || !plan) {
    console.error('Missing required parameters');
    return res.redirect(302, `${process.env.NEXT_PUBLIC_BASE_URL}/generate?payment=error&reason=missing_parameters`);
  }

  try {
    // Verify the payment with Flutterwave
    const transaction = await flw.Transaction.verify({
      id: transaction_id
    });

    console.log('Transaction verification response:', transaction);

    if (transaction.data.status === "successful") {
      const now = new Date();
      const subscriptionEnd = new Date(now);
      
      if (plan === 'yearly') {
        subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
      } else {
        subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
      }

      // Update user subscription
      const userRef = adminDb.collection('users').doc(userId);
      const updateData = {
        subscription: 'pro',
        subscriptionType: plan,
        scriptsRemaining: 100,
        scriptsLimit: 100,
        subscriptionEnd: subscriptionEnd.toISOString(),
        paid: true,
        lastPayment: adminDb.FieldValue.serverTimestamp(),
        upgradedAt: adminDb.FieldValue.serverTimestamp(),
        paymentAmount: transaction.data.amount,
        paymentCurrency: transaction.data.currency,
        transactionId: transaction_id
      };

      console.log('Updating user subscription:', { userId, updateData });
      await userRef.update(updateData);

      // Log payment
      await adminDb.collection('payments').add({
        userId,
        email: transaction.data.customer.email,
        amount: transaction.data.amount,
        currency: transaction.data.currency,
        status: 'successful',
        type: plan,
        transactionId: transaction_id,
        transactionRef: tx_ref,
        date: adminDb.FieldValue.serverTimestamp(),
        paymentMethod: 'flutterwave'
      });

      console.log('Payment logged successfully');
      return res.redirect(302, `${process.env.NEXT_PUBLIC_BASE_URL}/generate?payment=success`);
    } else {
      console.error('Payment verification failed:', transaction.data);
      return res.redirect(302, `${process.env.NEXT_PUBLIC_BASE_URL}/generate?payment=failed`);
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.redirect(302, `${process.env.NEXT_PUBLIC_BASE_URL}/generate?payment=error&reason=verification_failed`);
  }
}