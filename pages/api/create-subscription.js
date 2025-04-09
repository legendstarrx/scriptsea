import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { plan, email, name } = req.body;
    
    // Create direct payment link without payment plan
    const paymentLink = plan === 'monthly' 
      ? 'https://flutterwave.com/pay/vsxo1pgmcjhl'
      : 'https://flutterwave.com/pay/x1wjudjheco3';

    // Return the direct payment link
    return res.status(200).json({ 
      success: true,
      paymentLink: paymentLink
    });

  } catch (error) {
    console.error('Subscription creation error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to create subscription',
      message: error.message 
    });
  }
} 