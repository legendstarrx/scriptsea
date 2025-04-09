import { useState } from 'react';

export default function SubscriptionModal({ onClose, user }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpgrade = async (plan) => {
    setLoading(true);
    setError('');

    try {
      const amount = plan === 'monthly' ? 499 : 4999; // Amount in cents
      
      // Configure Flutterwave payment
      const config = {
        public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY,
        tx_ref: `tx_${user.email}_${Date.now()}`,
        amount: amount / 100, // Convert cents to dollars
        currency: "USD",
        payment_options: "card",
        customer: {
          email: user.email,
          name: user.displayName || user.email
        },
        customizations: {
          title: "ScriptSea Pro Subscription",
          description: `${plan === 'monthly' ? 'Monthly' : 'Yearly'} Pro Plan`,
          logo: "https://scriptsea.com/logo.png"
        },
        callback: function(response) {
          // Close payment modal
          if (response.status === "successful") {
            // Verify the transaction on the server
            fetch(`/api/payment/verify?transaction_id=${response.transaction_id}&tx_ref=${response.tx_ref}&status=successful`)
              .then(res => res.json())
              .then(data => {
                if (data.status === 'success') {
                  window.location.href = '/dashboard?payment=success';
                }
              })
              .catch(err => console.error('Verification error:', err));
          }
        },
        onclose: function() {
          setLoading(false);
          onClose();
        }
      };

      // Initialize payment
      const FlutterwaveCheckout = window.FlutterwaveCheckout;
      if (FlutterwaveCheckout) {
        FlutterwaveCheckout(config);
      } else {
        throw new Error('Flutterwave not initialized');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('Failed to initialize payment. Please try again.');
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
        borderRadius: '20px',
        padding: '30px',
        maxWidth: '500px',
        width: '90%',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#666'
          }}
        >
          ×
        </button>

        <h2 style={{
          fontSize: '1.5rem',
          color: '#333',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          Upgrade to Pro
        </h2>

        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#FFF2F2',
            color: '#FF3366',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        <div style={{
          display: 'grid',
          gap: '20px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
        }}>
          {/* Monthly Plan */}
          <div style={{
            padding: '20px',
            border: '2px solid #FF3366',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '1.2rem', color: '#333', marginBottom: '10px' }}>
              Monthly Pro Plan
            </h3>
            <div style={{ fontSize: '2rem', color: '#FF3366', marginBottom: '10px' }}>
              $4.99
              <span style={{ fontSize: '1rem', color: '#666' }}>/month</span>
            </div>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: '20px 0',
              textAlign: 'left'
            }}>
              <li style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ✓ <span>100 scripts per month</span>
              </li>
              <li style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ✓ <span>Priority support</span>
              </li>
              <li style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ✓ <span>Advanced features</span>
              </li>
            </ul>
            <button
              onClick={() => handleUpgrade('monthly')}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#FF3366',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Processing...' : 'Upgrade Monthly'}
            </button>
          </div>

          {/* Yearly Plan */}
          <div style={{
            padding: '20px',
            border: '2px solid #FF3366',
            borderRadius: '12px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '-30px',
              transform: 'rotate(45deg)',
              backgroundColor: '#FF3366',
              color: 'white',
              padding: '5px 40px',
              fontSize: '0.8rem'
            }}>
              Save 17%
            </div>
            <h3 style={{ fontSize: '1.2rem', color: '#333', marginBottom: '10px' }}>
              Yearly Pro Plan
            </h3>
            <div style={{ fontSize: '2rem', color: '#FF3366', marginBottom: '10px' }}>
              $49.99
              <span style={{ fontSize: '1rem', color: '#666' }}>/year</span>
            </div>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: '20px 0',
              textAlign: 'left'
            }}>
              <li style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ✓ <span>100 scripts per month</span>
              </li>
              <li style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ✓ <span>Priority support</span>
              </li>
              <li style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ✓ <span>Advanced features</span>
              </li>
              <li style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ✓ <span>2 months free</span>
              </li>
            </ul>
            <button
              onClick={() => handleUpgrade('yearly')}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#FF3366',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Processing...' : 'Upgrade Yearly'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 