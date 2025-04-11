import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function PaymentSuccess() {
  const router = useRouter();
  const [status, setStatus] = useState('Verifying payment...');

  useEffect(() => {
    const verifyPayment = async () => {
      const { ref, plan } = router.query;

      if (!ref || !plan) {
        setStatus('Invalid payment reference');
        setTimeout(() => router.push('/payment-error?message=invalid-reference'), 2000);
        return;
      }

      try {
        const response = await axios.post('/api/verify-payment', {
          reference: ref,
          plan
        });

        if (response.data.success) {
          setStatus('Payment successful! Redirecting...');
          setTimeout(() => router.push('/generate?payment=success'), 2000);
        } else {
          setStatus('Payment verification failed');
          setTimeout(() => router.push('/payment-error?message=verification-failed'), 2000);
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('Payment verification failed');
        setTimeout(() => router.push('/payment-error?message=server-error'), 2000);
      }
    };

    if (router.isReady) {
      verifyPayment();
    }
  }, [router.isReady, router.query]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Payment Verification</h1>
        <p className="text-gray-600">{status}</p>
      </div>
    </div>
  );
} 