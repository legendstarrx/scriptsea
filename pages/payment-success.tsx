import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function PaymentSuccess() {
  const router = useRouter();
  const [status, setStatus] = useState('Payment received! Finalizing your Pro access...');

  useEffect(() => {
    if (router.isReady) {
      const timer = setTimeout(() => {
        router.push('/generate?payment=success');
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [router.isReady, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Checkout Complete</h1>
        <p className="text-gray-600">{status}</p>
      </div>
    </div>
  );
} 
 