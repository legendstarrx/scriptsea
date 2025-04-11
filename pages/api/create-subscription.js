import axios from 'axios';

const MONTHLY_PLAN = 'PLN_2k30q94zztr27aq'; // NGN 8,000
const YEARLY_PLAN = 'PLN_1y9d4qq8g9qmjos';  // NGN 80,000

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { plan, amount, email, name, userId } = req.body;

    // Validate inputs
    if (!plan || !amount || !email || !userId) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields' 
      });
    }

    // Initialize Paystack transaction
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        amount: amount * 100, // Convert to kobo
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/verify`,
        metadata: {
          userId,
          plan_type: plan
        }
      })
    });

    const data = await response.json();

    if (!data.status) {
      throw new Error(data.message);
    }

    return res.status(200).json({
      success: true,
      paymentLink: data.data.authorization_url
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create subscription'
    });
  }
} 