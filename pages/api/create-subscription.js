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

    // Make sure PAYSTACK_SECRET_KEY is properly set
    if (!process.env.PAYSTACK_SECRET_KEY) {
      throw new Error('Paystack secret key is not configured');
    }

    // Initialize Paystack transaction
    const response = await axios({
      method: 'POST',
      url: 'https://api.paystack.co/transaction/initialize',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY.trim()}`,
        'Content-Type': 'application/json'
      },
      data: {
        email,
        amount: amount * 100, // Convert to kobo
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/verify`,
        metadata: {
          userId,
          plan_type: plan,
          custom_fields: [{
            display_name: "User ID",
            variable_name: "user_id",
            value: userId
          }, {
            display_name: "Plan Type",
            variable_name: "plan_type",
            value: plan
          }]
        }
      }
    });

    return res.status(200).json({
      success: true,
      paymentLink: response.data.data.authorization_url
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create subscription. Please try again.'
    });
  }
} 