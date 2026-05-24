export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { plan, userId, email } = req.body;
    if (!plan || !userId || !email) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    if (!process.env.POLAR_ACCESS_TOKEN) {
      throw new Error('POLAR_ACCESS_TOKEN is not configured');
    }

    const isMonthly = plan === 'monthly';
    const productId = isMonthly
      ? process.env.POLAR_PRODUCT_MONTHLY_ID
      : process.env.POLAR_PRODUCT_WEEKLY_ID;

    if (!productId) {
      throw new Error(
        isMonthly ? 'POLAR_PRODUCT_MONTHLY_ID is not configured' : 'POLAR_PRODUCT_WEEKLY_ID is not configured'
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://scriptsea.com';

    const paymentResponse = await fetch('https://api.polar.sh/v1/checkouts/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.POLAR_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        products: [productId],
        success_url: `${baseUrl}/payment-success?plan=${plan}`,
        return_url: `${baseUrl}/generate?payment=failed`,
        customer_email: email,
        external_customer_id: userId,
        metadata: {
          userId,
          email,
          plan
        }
      })
    });

    const payment = await paymentResponse.json();
    if (!paymentResponse.ok) {
      throw new Error(payment?.detail || payment?.error || 'Failed to create checkout');
    }

    if (!payment?.url) {
      throw new Error('No Polar checkout URL returned');
    }

    return res.status(200).json({
      success: true,
      paymentLink: payment.url
    });
  } catch (error) {
    console.error('Create payment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to start checkout. Please try again.'
    });
  }
}