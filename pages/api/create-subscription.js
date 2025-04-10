import axios from 'axios';
import { db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const PAYSTACK_SECRET_KEY = 'sk_live_3917d76c2e7443aade1cbe0f540244108364711f';
const MONTHLY_PLAN = 'PLN_2k30q94zztr27aq';
const YEARLY_PLAN = 'PLN_1y9d4qq8g9qmjos';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { plan, email, name } = req.body;
    
    // Initialize Paystack subscription
    const response = await axios({
      method: 'post',
      url: 'https://api.paystack.co/transaction/initialize',
      headers: { 
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      data: {
        email: email,
        plan: plan === 'monthly' ? MONTHLY_PLAN : YEARLY_PLAN,
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success`,
        metadata: {
          name: name,
          plan_type: plan
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