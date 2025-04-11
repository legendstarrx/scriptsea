import axios from 'axios';

const MONTHLY_PLAN = 'PLN_2k30q94zztr27aq'; // NGN 8,000
const YEARLY_PLAN = 'PLN_1y9d4qq8g9qmjos';  // NGN 80,000

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { plan, email, name } = req.body;
    
    // Remove any potential whitespace from the secret key
    const secretKey = process.env.PAYSTACK_SECRET_KEY.trim();
    
    const response = await axios({
      method: 'post',
      url: 'https://api.paystack.co/transaction/initialize',
      headers: { 
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      },
      data: {
        email: email,
        plan: plan === 'monthly' ? MONTHLY_PLAN : YEARLY_PLAN,
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success`,
        currency: 'NGN', // Explicitly set currency to Naira
        metadata: {
          name: name,
          plan_type: plan,
          display_currency: 'USD',
          display_amount: plan === 'monthly' ? 4.99 : 49.99
        }
      }
    });

    if (response.data.status) {
      return res.status(200).json({
        success: true,
        paymentLink: response.data.data.authorization_url
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