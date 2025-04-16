import Flutterwave from 'flutterwave-node-v3';
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
}

function calculateEndDate(plan) {
  const date = new Date();
  if (plan === 'yearly') {
    date.setFullYear(date.getFullYear() + 1);
  } else {
    date.setMonth(date.getMonth() + 1);
  }
  return date;
} 