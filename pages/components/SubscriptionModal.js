const handleUpgrade = async (plan) => {
  try {
    const response = await fetch('/api/create-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        plan: plan === 'yearly' ? 'yearly' : 'monthly',
        userId: user.uid,
        email: user.email
      })
    });

    const data = await response.json();
    if (data.success && data.paymentLink) {
      window.location.href = data.paymentLink;
    } else {
      console.error('Failed to create payment link');
    }
  } catch (error) {
    console.error('Error initiating payment:', error);
  }
}; 