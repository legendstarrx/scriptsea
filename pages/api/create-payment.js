import { adminDb } from '../../lib/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { plan, userId, email } = req.body;
    
    // Set amount based on plan
    const amount = plan === 'yearly' ? 49.99 : 4.99;
    
    // Create payment plan for recurring payments
    const planDetails = {
      amount: amount * 100, // Convert to cents
      name: `Pro ${plan} Subscription`,
      interval: plan === 'yearly' ? 'yearly' : 'monthly',
      currency: 'USD'
    };

    const response = await fetch('https://api.flutterwave.com/v3/payment-plans', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(planDetails)
    });

    const planData = await response.json();
    
    if (!planData.data) {
      throw new Error('Failed to create payment plan');
    }

    // Create payment link
    const paymentData = {
      tx_ref: `tx-${Date.now()}`,
      amount: amount,
      currency: 'USD',
      payment_options: 'card',
      payment_plan: planData.data.id,
      customer: {
        email: email,
      },
      meta: {
        userId: userId,
        plan_type: plan
      },
      redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/verify-flutterwave`,
      customizations: {
        title: 'Pro Subscription',
        description: `${plan} subscription payment`
      }
    };

    const paymentResponse = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });

    const payment = await paymentResponse.json();

    if (payment.data && payment.data.link) {
      return res.status(200).json({ 
        success: true, 
        paymentLink: payment.data.link 
      });
    }

    throw new Error('Failed to create payment link');
  } catch (error) {
    console.error('Payment creation error:', error);
    return res.status(500).json({ error: 'Failed to create payment' });
  }
} 