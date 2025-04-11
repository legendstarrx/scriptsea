import { useRouter } from 'next/router';

export default function PaymentError() {
  const router = useRouter();
  const { message } = router.query;

  const errorMessages = {
    'invalid-reference': 'Invalid payment reference',
    'verification-failed': 'Payment verification failed',
    'server-error': 'Server error occurred',
    'default': 'An error occurred during payment processing'
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Payment Failed</h1>
        <p className="text-gray-600 mb-6">
          {errorMessages[message as keyof typeof errorMessages] || errorMessages.default}
        </p>
        <button
          onClick={() => router.push('/generate')}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Return to Generate
        </button>
      </div>
    </div>
  );
} 