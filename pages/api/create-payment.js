export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { plan, userId, email } = req.body;

    // Define the correct amount and plan ID
    const isYearly = plan === 'yearly';
    const amount = isYearly ? 49.99 : 4.99;
    const planId = isYearly ? 140698 : 140697;

    // Prepare the payment payload
    const paymentData = {
      tx_ref: `tx-${Date.now()}`,
      amount: amount,
      currency: 'USD',
      payment_options: 'card',
      payment_plan: planId,
      customer: {
        email: email
      },
      meta: {
        userId: userId,
        plan_type: plan
      },
      redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/verify-flutterwave`,
      customizations: {
        title: 'Pro Subscription',
        description: `${plan} subscription payment`
      }
    };

    // Make request to Flutterwave
    const paymentResponse = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });

    const payment = await paymentResponse.json();

    if (!payment.data?.link) {
      throw new Error('Failed to create payment link');
    }

    return res.status(200).json({
      success: true,
      paymentLink: payment.data.link
    });

  } catch (error) {
    console.error('Create payment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create payment. Please try again.'
    });
  }
}