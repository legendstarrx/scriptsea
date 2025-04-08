import { db } from '../../../lib/firebase';
import { collection, doc, updateDoc, addDoc } from 'firebase/firestore';

// Load environment variables
const WEBHOOK_HASH = process.env.FLUTTERWAVE_WEBHOOK_HASH;
const TEST_SECRET_KEY = process.env.FLUTTERWAVE_TEST_SECRET_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify webhook signature
    const signature = req.headers['verif-hash'];
    if (!signature || signature !== process.env.FLW_WEBHOOK_SECRET) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ message: 'Invalid signature' });
    }

    const event = req.body;
    console.log('Received webhook event:', event);

    // Only process successful charges
    if (event.event === 'charge.completed' && event.data.status === 'successful') {
      const { customer, amount, currency, tx_ref, id: transactionId } = event.data;
      
      // Verify transaction with Flutterwave
      const verifyResponse = await fetch(
        `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const verification = await verifyResponse.json();
      
      if (verification.status === 'success' && verification.data.status === 'successful') {
        // Determine subscription type based on amount
        const isYearlyPlan = amount === 4999; // $49.99
        const isMonthlyPlan = amount === 499;  // $4.99

        if (isMonthlyPlan || isYearlyPlan) {
          // Get user email from the payment
          const userEmail = customer.email;
          
          // Calculate subscription end date
          const subscriptionEnd = new Date();
          if (isYearlyPlan) {
            subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
          } else {
            subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
          }

          try {
            // Update user subscription in Firestore
            const usersRef = collection(db, 'users');
            const userDoc = doc(usersRef, userEmail);

            await updateDoc(userDoc, {
              subscription: 'pro',
              scriptsRemaining: 100,
              subscriptionEnd: subscriptionEnd.toISOString(),
              lastPayment: new Date().toISOString(),
              paymentAmount: amount,
              paymentCurrency: currency,
              subscriptionType: isYearlyPlan ? 'yearly' : 'monthly'
            });

            // Log payment in payment history
            const paymentsRef = collection(db, 'payments');
            await addDoc(paymentsRef, {
              userId: userEmail,
              userEmail: userEmail,
              amount: amount,
              currency: currency,
              status: 'successful',
              type: isYearlyPlan ? 'yearly' : 'monthly',
              transactionId: transactionId,
              transactionRef: tx_ref,
              date: new Date().toISOString(),
              paymentMethod: event.data.payment_type,
              verificationResponse: verification.data
            });

            console.log(`Successfully updated subscription for user: ${userEmail}`);
            return res.status(200).json({ 
              message: 'Subscription updated successfully',
              userEmail: userEmail,
              plan: isYearlyPlan ? 'yearly' : 'monthly'
            });
          } catch (error) {
            console.error('Error updating user subscription:', error);
            return res.status(500).json({ 
              message: 'Error updating subscription',
              error: error.message 
            });
          }
        }
      } else {
        console.error('Transaction verification failed:', verification);
        return res.status(400).json({ message: 'Transaction verification failed' });
      }
    }

    // Return 200 for other webhook events
    return res.status(200).json({ message: 'Webhook processed' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ message: 'Error processing webhook' });
  }
} 