import { Flutterwave } from 'flutterwave-node-v3';

const flw = new Flutterwave(
  process.env.FLUTTERWAVE_PUBLIC_KEY,
  process.env.FLUTTERWAVE_SECRET_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { plan, email, name } = req.body;
    
    // Create payment plan first
    const planResponse = await flw.PaymentPlan.create({
      name: `ScriptSea Pro ${plan === 'monthly' ? 'Monthly' : 'Yearly'}`,
      amount: plan === 'monthly' ? 499 : 4999, // Amount in cents
      interval: plan === 'monthly' ? 'monthly' : 'yearly',
      currency: 'USD',
      duration: 12
    });

    if (!planResponse.data) {
      throw new Error('Failed to create payment plan');
    }

    // Create payment link
    const paymentResponse = await flw.Payment.initiate({
      tx_ref: `sub_${Date.now()}_${email}`,
      amount: plan === 'monthly' ? 4.99 : 49.99,
      currency: 'USD',
      payment_options: 'card',
      customer: {
        email: email,
        name: name
      },
      payment_plan: planResponse.data.id,
      customizations: {
        title: 'ScriptSea Pro Subscription',
        description: `${plan === 'monthly' ? 'Monthly' : 'Yearly'} Pro Plan`,
        logo: 'https://scriptsea.com/logo.png'
      },
      redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success`
    });

    return res.status(200).json({ 
      paymentLink: paymentResponse.data.link,
      planId: planResponse.data.id 
    });
  } catch (error) {
    console.error('Subscription creation error:', error);
    return res.status(500).json({ error: 'Failed to create subscription' });
  }
} 