import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { plan, email, name } = req.body;
    
    // Set up payment details
    const amount = plan === 'monthly' ? '4.99' : '49.99';
    const tx_ref = `sub_${Date.now()}_${email}`;

    // Create payment using Flutterwave Standard
    const response = await axios.post(
      'https://api.flutterwave.com/v3/payments',
      {
        tx_ref: tx_ref,
        amount: amount,
        currency: 'USD',
        payment_options: 'card',
        redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success`,
        customer: {
          email: email,
          name: name
        },
        customizations: {
          title: 'ScriptSea Pro Subscription',
          description: `${plan === 'monthly' ? 'Monthly' : 'Yearly'} Pro Plan`,
          logo: 'https://scriptsea.com/logo.png'
        },
        meta: {
          plan_type: plan,
          user_email: email
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Return the hosted payment link from Flutterwave
    return res.status(200).json({
      success: true,
      paymentLink: response.data.data.link
    });

  } catch (error) {
    console.error('Subscription creation error:', error.response?.data || error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create subscription',
      message: error.response?.data?.message || error.message
    });
  }
} 