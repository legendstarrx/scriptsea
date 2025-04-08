import { Flutterwave } from 'flutterwave-node-v3';

const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId, amount } = req.body;
    
    // Create a unique transaction reference
    const tx_ref = `user_${userId}_${Date.now()}`;

    // Create payment link
    const response = await flw.PaymentLink.create({
      title: "Pro Subscription",
      description: "Upgrade to Pro plan",
      amount: amount,
      currency: "USD",
      redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success`,
      tx_ref: tx_ref,
      customer: {
        email: req.body.email,
        name: req.body.name
      },
      customizations: {
        title: "ScriptSea Pro",
        logo: "https://your-logo-url.com/logo.png"
      }
    });

    return res.status(200).json({
      paymentLink: response.data.link,
      tx_ref: tx_ref
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return res.status(500).json({ message: 'Error creating payment' });
  }
} 