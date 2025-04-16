import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const SubscriptionModal = ({ isOpen, onClose, userProfile }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
  const isPro = currentSubscription === 'pro' || currentSubscription === 'premium';

  const handleUpgrade = async (plan) => {
    try {
      setLoading(true);
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          plan,
          userId: user.uid,
          email: user.email
        })
      });

      const data = await response.json();
      if (data.success && data.paymentLink) {
        window.location.href = data.paymentLink;
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      setError('Failed to process payment. Please try again.');
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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>×</button>
        
        {isPro ? (
          <div className="pro-status">
            <div className="pro-badge">PRO</div>
            <h2>You're Already a Pro Member!</h2>
            <p>Enjoy unlimited access to all premium features.</p>
          </div>
        ) : (
          <>
            <h2>Upgrade Your Experience</h2>
            <div className="current-plan">
              <span>Current Plan:</span>
              <span className={`plan-badge ${currentSubscription}`}>
                {currentSubscription.toUpperCase()}
              </span>
            </div>

            <div className="plans-container">
              {Object.entries(plans).map(([planType, plan]) => (
                <div key={planType} className="plan-card">
                  <h3>{planType === 'monthly' ? 'Monthly Pro' : 'Yearly Pro'}</h3>
                  <div className="price">{plan.price}</div>
                  <div className="features">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="feature">
                        <span className="checkmark">✓</span>
                        {feature}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => handleUpgrade(planType)}
                    disabled={loading}
                    className="upgrade-button"
                  >
                    {loading ? 'Processing...' : 'Upgrade Now'}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
        
        {error && <div className="error-message">{error}</div>}
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          padding: 30px;
          max-width: 800px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        .close-button {
          position: absolute;
          top: 15px;
          right: 15px;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
          padding: 5px;
          line-height: 1;
        }

        h2 {
          color: #333;
          text-align: center;
          margin-bottom: 20px;
          font-size: 1.8rem;
        }

        .current-plan {
          text-align: center;
          margin-bottom: 30px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          font-size: 1.1rem;
        }

        .plan-badge {
          padding: 5px 15px;
          border-radius: 20px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .plan-badge.free {
          background: #f0f0f0;
          color: #666;
        }

        .plan-badge.pro, .plan-badge.premium {
          background: #FF3366;
          color: white;
        }

        .plans-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .plan-card {
          border: 2px solid #f0f0f0;
          border-radius: 12px;
          padding: 25px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .plan-card:hover {
          border-color: #FF3366;
          transform: translateY(-5px);
        }

        .price {
          font-size: 2.5rem;
          font-weight: 700;
          color: #FF3366;
          margin: 15px 0;
        }

        .features {
          margin: 20px 0;
          text-align: left;
        }

        .feature {
          margin: 10px 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .checkmark {
          color: #FF3366;
          font-weight: bold;
        }

        .upgrade-button {
          width: 100%;
          padding: 12px;
          background: #FF3366;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .upgrade-button:hover {
          background: #ff1f4f;
        }

        .upgrade-button:disabled {
          background: #ffb3c4;
          cursor: not-allowed;
        }

        .error-message {
          color: #ff3366;
          text-align: center;
          margin-top: 20px;
        }

        .pro-status {
          text-align: center;
          padding: 40px 20px;
        }

        .pro-badge {
          background: #FF3366;
          color: white;
          padding: 8px 20px;
          border-radius: 25px;
          font-weight: 700;
          font-size: 1.2rem;
          display: inline-block;
          margin-bottom: 20px;
        }

        @media (max-width: 768px) {
          .modal-content {
            padding: 20px;
            width: 95%;
          }

          .plans-container {
            grid-template-columns: 1fr;
          }

          h2 {
            font-size: 1.5rem;
          }

          .price {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default SubscriptionModal; 