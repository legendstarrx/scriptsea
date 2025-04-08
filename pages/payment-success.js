import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function PaymentSuccess() {
  const router = useRouter();
  const [status, setStatus] = useState('verifying...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const { transaction_id, tx_ref } = router.query;
      
      if (!transaction_id || !tx_ref) {
        setError('Missing transaction details');
        return;
      }

      try {
        const response = await fetch(`/api/payment/verify?transaction_id=${transaction_id}&tx_ref=${tx_ref}&status=successful`);
        const data = await response.json();
        
        if (data.status === 'success') {
          setStatus('success');
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            router.push('/dashboard');
          }, 3000);
        } else {
          setStatus('failed');
          setError(data.message || 'Payment verification failed');
        }
      } catch (err) {
        setStatus('error');
        setError('Error verifying payment');
        console.error('Verification error:', err);
      }
    };

    if (router.isReady) {
      verifyPayment();
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            {status === 'success' ? 'Payment Successful!' : 'Processing Payment...'}
          </h2>
          {error && (
            <p className="mt-2 text-red-600">{error}</p>
          )}
          {status === 'success' && (
            <p className="mt-2 text-gray-600">
              You will be redirected to your dashboard shortly...
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 