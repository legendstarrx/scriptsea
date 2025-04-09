import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function SubscriptionModal({ onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

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
      
      if (data.paymentLink) {
        window.location.href = data.paymentLink;
      } else {
        throw new Error('No payment link received');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      setError('Failed to create subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '12px',
        maxWidth: '600px',
        width: '90%'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Upgrade to Pro</h2>
        
        {error && (
          <div style={{ color: 'red', marginBottom: '15px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Monthly Plan */}
          <div style={{
            padding: '20px',
            border: '1px solid #ddd',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <h3>Monthly Pro Plan</h3>
            <div style={{ fontSize: '24px', margin: '15px 0' }}>
              $4.99<span style={{ fontSize: '14px' }}>/month</span>
            </div>
            <button
              onClick={() => handleUpgrade('monthly')}
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: loading ? '#ccc' : '#FF3366',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Processing...' : 'Subscribe Monthly'}
            </button>
          </div>

          {/* Yearly Plan */}
          <div style={{
            padding: '20px',
            border: '2px solid #FF3366',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <h3>Yearly Pro Plan</h3>
            <div style={{ fontSize: '24px', margin: '15px 0' }}>
              $49.99<span style={{ fontSize: '14px' }}>/year</span>
            </div>
            <button
              onClick={() => handleUpgrade('yearly')}
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: loading ? '#ccc' : '#FF3366',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Processing...' : 'Subscribe Yearly'}
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: '20px',
            padding: '10px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: '#666'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
} 