import { db } from '../../../lib/firebase';
import { collection, doc, updateDoc, addDoc, query, where, getDocs } from 'firebase/firestore';

// Load environment variables
const WEBHOOK_HASH = process.env.FLUTTERWAVE_WEBHOOK_HASH;
const TEST_SECRET_KEY = process.env.FLUTTERWAVE_TEST_SECRET_KEY;

export default async function handler(req, res) {
  console.log('Webhook received:', {
    method: req.method,
    headers: req.headers,
    body: req.body
  });

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify webhook signature
    const signature = req.headers['verif-hash'];
    console.log('Webhook signature:', signature);
    
    if (signature !== process.env.FLUTTERWAVE_WEBHOOK_SECRET) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    console.log('Received webhook event:', event);

    // Only process successful charges
    if (event.event === 'charge.completed') {
      const { customer, amount, currency, tx_ref, id: transactionId } = event.data;
      
      try {
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

          if (isYearlyPlan || isMonthlyPlan) {
            // Get user email from the payment
            const userEmail = customer.email;
            
            // Find user by email first
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('email', '==', userEmail));
            const userSnapshot = await getDocs(q);
            
            if (userSnapshot.empty) {
                console.error(`No user found with email: ${userEmail}`);
                return res.status(404).json({ error: 'User not found' });
            }

            const userId = userSnapshot.docs[0].id;
            const userDoc = doc(db, 'users', userId);

            // Calculate subscription end date
            const subscriptionEnd = new Date();
            if (isYearlyPlan) {
              subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
            } else {
              subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
            }

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
              userId: userId,
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

            console.log(`Successfully updated subscription for user: ${userEmail} (${userId})`);
            return res.status(200).json({ 
              message: 'Subscription updated successfully',
              userEmail: userEmail,
              userId: userId,
              plan: isYearlyPlan ? 'yearly' : 'monthly'
            });
          }
        }
      } catch (error) {
        console.error('Error updating user subscription:', error);
        return res.status(500).json({ 
          message: 'Error updating subscription',
          error: error.message 
        });
      }
    }

    // Return 200 for other webhook events
    return res.status(200).json({ message: 'Webhook processed' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ message: 'Error processing webhook' });
  }
} 