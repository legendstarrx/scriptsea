import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { plan, email, name } = req.body;
    
    // Set up payment details (amount in cents)
    const amount = plan === 'monthly' ? '499' : '4999'; // $4.99 or $49.99
    const tx_ref = `sub_${Date.now()}_${email.split('@')[0]}`;

    const payload = {
      tx_ref: tx_ref,
      amount: amount,
      currency: 'USD',
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
    };

    const response = await axios({
      method: 'post',
      url: 'https://api.flutterwave.com/v3/payments',
      headers: { 
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      data: payload
    });

    if (response.data.status === 'success') {
      return res.status(200).json({
        success: true,
        paymentLink: response.data.data.link
      });
    } else {
      throw new Error(response.data.message || 'Failed to create payment link');
    }

  } catch (error) {
    console.error('Subscription creation error:', error.response?.data || error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create subscription',
      message: error.response?.data?.message || error.message
    });
  }
} 