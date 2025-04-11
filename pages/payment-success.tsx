import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // Make sure this path is correct

export default function PaymentSuccess() {
  const router = useRouter();
  const [status, setStatus] = useState('Verifying payment...');
  const { user } = useAuth();

  useEffect(() => {
    const verifyPayment = async () => {
      // Get reference from URL (note: changed from ref to reference to match Paystack's standard)
      const { reference, plan } = router.query;

      if (!reference || !plan || !user) {
        setStatus('Missing required information');
        setTimeout(() => router.push('/payment-error?message=invalid-parameters'), 2000);
        return;
      }

      try {
        // Call our API endpoint to verify and update
        const response = await axios.post('/api/verify-payment', {
          reference: reference as string,
          plan: plan as string,
          userId: user.uid
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

    if (router.isReady && user) {
      verifyPayment();
    }
  }, [router.isReady, router.query, user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Payment Verification</h1>
        <p className="text-gray-600">{status}</p>
      </div>
    </div>
  );
} 
 