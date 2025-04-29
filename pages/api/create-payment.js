import { db } from '../../lib/firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { plan, userId, email } = req.body;

    // Define plan configurations
    const plans = {
      monthly: {
        planId: '140947',
        price: 999, // $9.99 in cents
        name: 'Monthly Pro',
        description: '100 scripts per month'
      },
      yearly: {
        planId: '140948',
        price: 9999, // $99.99 in cents
        name: 'Yearly Pro',
        description: '1200 scripts per year'
      }
    };

    const selectedPlan = plans[plan];
    if (!selectedPlan) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    // Create payment session with your payment provider
    const paymentSession = await createPaymentSession({
      planId: selectedPlan.planId,
      price: selectedPlan.price,
      name: selectedPlan.name,
      description: selectedPlan.description,
      userId,
      email
    });

    // Store pending subscription in Firestore
    await db.collection('pending_subscriptions').doc(userId).set({
      userId,
      email,
      plan,
      planId: selectedPlan.planId,
      price: selectedPlan.price,
      createdAt: new Date().toISOString(),
      status: 'pending'
    });

    return res.status(200).json({
      success: true,
      paymentLink: paymentSession.url
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return res.status(500).json({
      error: 'Failed to create payment session'
    });
  }
}

async function createPaymentSession({
  planId,
  price,
  name,
  description,
  userId,
  email
}) {
  // Implement your payment provider's session creation here
  // Example with a generic payment provider:
  return {
    url: `/api/process-payment?plan=${planId}&price=${price}&userId=${userId}`
  };
}