import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function SubscriptionModal({ onClose, userProfile }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const plans = {
    monthly: {
      price: '$4.99',
      amount: 8000,
      features: ['100 scripts per month', 'Priority support', 'Advanced features']
    },
    yearly: {
      price: '$49.99',
      amount: 80000,
      features: ['100 scripts per month', 'Priority support', 'Advanced features', '2 months free']
    }
  };

  const currentSubscription = userProfile?.subscription || 'free';

  const handleUpgrade = async (plan) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          amount: plans[plan].amount,
          email: user.email,
          name: user.displayName || user.email,
          userId: user.uid
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create subscription');
      }
      
      if (data.success && data.paymentLink) {
        window.location.href = data.paymentLink;
      } else {
        throw new Error(data.message || 'Failed to create subscription');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      setError('Failed to process subscription. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          subscriptionId: userProfile?.subscriptionId
        })
      });

      const data = await response.json();
      if (data.success) {
        setError('Subscription cancelled successfully');
        setTimeout(() => onClose(), 2000);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setError('Failed to cancel subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full mx-4 relative">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
          <p className="text-gray-500 mt-2">Select the plan that best fits your needs</p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Monthly Plan */}
          <div className="border border-gray-200 rounded-xl p-6 hover:border-blue-500 transition-all duration-200">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900">Monthly</h3>
              <div className="mt-4 flex justify-center items-baseline">
                <span className="text-4xl font-bold text-gray-900">{plans.monthly.price}</span>
                <span className="text-gray-500 ml-1">/month</span>
              </div>
              
              <ul className="mt-6 space-y-4 text-left">
                {plans.monthly.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade('monthly')}
                disabled={loading}
                className="mt-8 w-full bg-blue-600 text-white rounded-lg py-3 px-4 hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Get Started'}
              </button>
            </div>
          </div>

          {/* Yearly Plan */}
          <div className="border-2 border-blue-500 rounded-xl p-6 relative bg-white shadow-lg">
            <div className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3">
              <span className="bg-blue-500 text-white text-sm px-3 py-1 rounded-full">Best Value</span>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900">Yearly</h3>
              <div className="mt-4 flex justify-center items-baseline">
                <span className="text-4xl font-bold text-gray-900">{plans.yearly.price}</span>
                <span className="text-gray-500 ml-1">/year</span>
              </div>

              <ul className="mt-6 space-y-4 text-left">
                {plans.yearly.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade('yearly')}
                disabled={loading}
                className="mt-8 w-full bg-blue-600 text-white rounded-lg py-3 px-4 hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Get Started'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-6 text-center text-red-600">
            {error}
          </div>
        )}
      </div>
    </div>
  );
} 