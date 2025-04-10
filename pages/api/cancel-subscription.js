import axios from 'axios';
import { db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const PAYSTACK_SECRET_KEY = 'sk_live_3917d76c2e7443aade1cbe0f540244108364711f';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, subscriptionId } = req.body;

    // Cancel subscription in Paystack
    await axios({
      method: 'post',
      url: `https://api.paystack.co/subscription/${subscriptionId}/disable`,
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // Update user in Firebase
    const userRef = doc(db, 'users', email);
    await updateDoc(userRef, {
      subscription: 'free',
      paid: false,
      scriptsRemaining: 3
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to cancel subscription' 
    });
  }
} 