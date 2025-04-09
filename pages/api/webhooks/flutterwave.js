import { db } from '../../../lib/firebase';
import { doc, updateDoc, collection, addDoc } from 'firebase/firestore';

// Load environment variables
const WEBHOOK_HASH = process.env.FLUTTERWAVE_WEBHOOK_HASH;
const TEST_SECRET_KEY = process.env.FLUTTERWAVE_TEST_SECRET_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify webhook signature without exposing the secret
    const signature = req.headers['verif-hash'];
    if (!signature || signature !== process.env.FLW_WEBHOOK_SECRET) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { customer, amount, currency, status } = req.body.data;
    
    if (status === 'successful') {
      // Update user subscription logic here
      // ... rest of the code ...
    }

    return res.status(200).json({ message: 'Webhook processed' });
  } catch (error) {
    console.error('Webhook error');
    return res.status(500).json({ message: 'Internal server error' });
  }
} 