import { adminDb } from '../../lib/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { plan, userId, email } = req.body;
    const amount = plan === 'yearly' ? 49.99 : 4.99;

    const paymentData = {
      tx_ref: `tx-${Date.now()}`,
      amount: amount,
      currency: 'USD',
      payment_options: 'card',
      customer: {
        email: email,
      },
      meta: {
        userId: userId,
        plan_type: plan
      },
      redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/verify-flutterwave?userId=${userId}&plan=${plan}`,
      customizations: {
        title: 'Pro Subscription',
        description: `${plan} subscription payment`
      }
    };

    console.log('Creating payment:', paymentData);

    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FLW_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });

    const data = await response.json();
    console.log('Flutterwave payment creation response:', data);

    if (data.status === 'success') {
      return res.status(200).json({ 
        success: true, 
        paymentLink: data.data.link 
      });
    }

    throw new Error('Failed to create payment link');
  } catch (error) {
    console.error('Payment creation error:', error);
    return res.status(500).json({ error: 'Failed to create payment' });
  }
} 