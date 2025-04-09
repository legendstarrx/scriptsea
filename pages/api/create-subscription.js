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
    
    // Create payment link for subscription
    const response = await flw.PaymentPlan.create({
      name: `ScriptSea Pro ${plan === 'monthly' ? 'Monthly' : 'Yearly'}`,
      amount: plan === 'monthly' ? 4.99 : 49.99,
      interval: plan === 'monthly' ? 'monthly' : 'annually',
      currency: 'USD',
      duration: 12 // Number of payments before subscription ends
    });

    // Create payment link
    const payment = await flw.Charge.create({
      payment_plan: response.data.id,
      customer: {
        email: email,
        name: name
      },
      customizations: {
        title: 'ScriptSea Pro Subscription',
        description: `${plan === 'monthly' ? 'Monthly' : 'Yearly'} Pro Plan`,
        logo: 'https://scriptsea.com/logo.png'
      },
      redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`
    });

    return res.status(200).json({ 
      paymentLink: payment.data.link,
      planId: response.data.id 
    });
  } catch (error) {
    console.error('Subscription creation error:', error);
    return res.status(500).json({ error: 'Failed to create subscription' });
  }
} 