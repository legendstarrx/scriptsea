import { Flutterwave } from 'flutterwave-node-v3';

const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify webhook signature
    const signature = req.headers['verif-hash'];
    if (signature !== process.env.FLW_WEBHOOK_SECRET) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    const payload = req.body;
    console.log('Received webhook payload:', payload);

    // Handle different event types
    if (payload.event === 'charge.completed') {
      const { tx_ref, status, amount } = payload.data;
      
      // Verify transaction
      const verification = await flw.Transaction.verify({ id: payload.data.id });
      
      if (verification.data.status === 'successful' && 
          verification.data.amount === amount) {
        
        // Extract user ID from tx_ref
        const userId = tx_ref.split('_')[1];
        
        // TODO: Update user's subscription status in your database
        // This is where you'll add your database update logic
        
        console.log(`Payment successful for user ${userId}`);
        return res.status(200).json({ message: 'Webhook processed successfully' });
      }
    }

    return res.status(200).json({ message: 'Webhook received' });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ message: 'Error processing webhook' });
  }
} 