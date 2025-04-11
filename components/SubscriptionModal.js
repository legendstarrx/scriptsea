import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function SubscriptionModal({ onClose, userProfile }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const plans = {
    monthly: {
      price: '$4.99',
      actualAmount: 'NGN 8,000.00',
      features: ['100 scripts per month', 'Priority support', 'Advanced features']
    },
    yearly: {
      price: '$49.99',
      actualAmount: 'NGN 80,000.00',
      features: ['100 scripts per month', 'Priority support', 'Advanced features', '2 months free']
    }
  };

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
          plan: plan,
          email: user.email,
          name: user.displayName || user.email
        })
      });

      const data = await response.json();
      
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
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Choose Your Plan</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {userProfile?.subscription === 'free' ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Monthly Plan */}
              <div className="border rounded-lg p-4 text-center">
                <h3 className="font-bold mb-2">Monthly</h3>
                <div className="text-2xl font-bold mb-1">{plans.monthly.price}</div>
                <div className="text-sm text-gray-500 mb-4">{plans.monthly.actualAmount}</div>
                <button
                  onClick={() => handleUpgrade('monthly')}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white rounded py-2 px-4 hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Choose Monthly'}
                </button>
              </div>

              {/* Yearly Plan */}
              <div className="border rounded-lg p-4 text-center">
                <h3 className="font-bold mb-2">Yearly</h3>
                <div className="text-2xl font-bold mb-1">{plans.yearly.price}</div>
                <div className="text-sm text-gray-500 mb-4">{plans.yearly.actualAmount}</div>
                <button
                  onClick={() => handleUpgrade('yearly')}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white rounded py-2 px-4 hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Choose Yearly'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="mb-4">
              You are currently on the {userProfile.subscription} plan.
            </p>
            <button
              onClick={handleCancelSubscription}
              disabled={loading}
              className="bg-red-600 text-white rounded py-2 px-4 hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Cancel Subscription'}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 text-red-600 text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

.plan {
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  margin: 10px;
  text-align: center;
}

.price {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 10px 0;
}

small {
  color: #666;
  display: block;
  margin-bottom: 15px;
}

.error {
  color: red;
  margin-top: 10px;
  text-align: center;
} 