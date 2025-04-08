import { useState } from 'react';

// Add FlutterWave test configuration
const FLUTTERWAVE_TEST_KEY = 'FLWPUBK_TEST-b38196e694e256c68a901ca2a1375f85-X';

export default function SubscriptionModal({ onClose, user }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTestInfo, setShowTestInfo] = useState(false);

  const handleUpgrade = async (plan) => {
    setLoading(true);
    setError('');

    try {
      const amount = plan === 'monthly' ? 499 : 4999; // $4.99 or $49.99
      
      // Use ngrok URL for payment verification, but keep localhost for auth
      const redirectUrl = `${process.env.NEXT_PUBLIC_TEST_BASE_URL}/api/payment/verify`;
      
      // Generate a unique transaction reference
      const tx_ref = `scriptsea-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Log the request details for debugging
      console.log('Creating payment with details:', {
        amount,
        redirectUrl,
        tx_ref,
        hasSecretKey: !!process.env.FLUTTERWAVE_TEST_SECRET_KEY,
        hasBaseUrl: !!process.env.NEXT_PUBLIC_TEST_BASE_URL
      });

      // Create payment link using FlutterWave API
      const response = await fetch('https://api.flutterwave.com/v3/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.FLUTTERWAVE_TEST_SECRET_KEY}`
        },
        body: JSON.stringify({
          tx_ref,
          amount,
          currency: 'USD',
          redirect_url: redirectUrl,
          customer: {
            email: user.email,
            name: user.displayName || 'Anonymous User'
          },
          customizations: {
            title: 'ScriptSea Pro Subscription',
            description: plan === 'monthly' ? 'Monthly Pro Plan' : 'Yearly Pro Plan'
          }
        })
      });

      // Log the response status
      console.log('FlutterWave API Response Status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('FlutterWave API Error:', errorData);
        throw new Error(errorData.message || `Failed to create payment link (Status: ${response.status})`);
      }

      const data = await response.json();
      console.log('FlutterWave API Success Response:', data);
      
      if (data.status === 'success') {
        // Open payment link in new tab
        window.open(data.data.link, '_blank');
        onClose();
      } else {
        throw new Error(data.message || 'Failed to create payment link');
      }
    } catch (error) {
      console.error('Payment error:', error);
      // Provide more specific error messages based on the error type
      if (error.message.includes('Failed to fetch')) {
        setError('Network error: Unable to connect to payment service. Please check your internet connection and try again.');
      } else if (!process.env.FLUTTERWAVE_TEST_SECRET_KEY) {
        setError('Configuration error: Payment service is not properly configured. Please contact support.');
      } else {
        setError(error.message || 'Failed to process upgrade. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const TestingInfo = () => (
    <div style={{
      padding: '1rem',
      marginBottom: '1rem',
      backgroundColor: '#f8f9ff',
      borderRadius: '8px',
      border: '1px solid #FF3366'
    }}>
      <h4 style={{ color: '#333', marginTop: 0 }}>Test Card Details (NGN):</h4>
      <ul style={{ 
        padding: '0 0 0 20px',
        margin: 0,
        color: '#666',
        fontSize: '0.9rem'
      }}>
        <li>Card Number: 5399 8383 8383 8381</li>
        <li>CVV: 123</li>
        <li>Expiry: Any future date (e.g. 12/25)</li>
        <li>PIN: 1234</li>
        <li>OTP: 12345</li>
      </ul>
      <p style={{ 
        fontSize: '0.8rem', 
        color: '#FF3366',
        marginTop: '10px',
        marginBottom: 0
      }}>
        Important Testing Notes:
        - Use localhost:3000 (not IP address)
        - For failed payments: OTP 5548 (Wrong OTP) or 6648 (Insufficient Funds)
        - Bank: Access Bank
        - Test Environment Active
      </p>
    </div>
  );

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
      zIndex: 1001
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ margin: 0, color: '#333' }}>Upgrade Your Plan</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        {error && (
          <div style={{
            padding: '1rem',
            marginBottom: '1rem',
            backgroundColor: '#FFF2F2',
            color: '#FF3366',
            borderRadius: '8px'
          }}>
            {error}
          </div>
        )}

        <button
          onClick={() => setShowTestInfo(!showTestInfo)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'transparent',
            color: '#FF3366',
            border: '1px solid #FF3366',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            marginBottom: '1rem',
            width: '100%'
          }}
        >
          {showTestInfo ? 'Hide Test Card Info' : 'Show Test Card Info'}
        </button>

        {showTestInfo && <TestingInfo />}

        {/* Test Mode Indicator */}
        <div style={{
          padding: '0.5rem',
          backgroundColor: '#e6f7ff',
          color: '#0066cc',
          borderRadius: '8px',
          marginBottom: '1rem',
          textAlign: 'center',
          fontSize: '0.9rem'
        }}>
          🔧 Test Mode Active - No real charges will be made
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {/* Current Plan Box */}
          <div style={{
            padding: '1.5rem',
            border: '1px solid #eee',
            borderRadius: '12px'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Current Plan</h3>
            <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Free Plan</p>
            <p style={{ margin: 0, color: '#666' }}>3 scripts forever</p>
          </div>

          {/* Monthly Pro Plan */}
          <div style={{
            padding: '1.5rem',
            border: '1px solid #FF3366',
            borderRadius: '12px',
            backgroundColor: '#FFF2F2',
            opacity: user?.subscription === 'pro' ? 0.7 : 1
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Monthly Pro Plan</h3>
            <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>100 scripts per month</p>
            <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Priority support</p>
            <p style={{ margin: '0 0 1rem 0', color: '#666' }}>Advanced features</p>
            <button
              onClick={() => handleUpgrade('monthly')}
              disabled={loading || user?.subscription === 'pro'}
              style={{
                width: '100%',
                padding: '1rem',
                backgroundColor: user?.subscription === 'pro' ? '#ccc' : '#FF3366',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: user?.subscription === 'pro' ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              {loading ? 'Processing...' : user?.subscription === 'pro' ? 'Current Plan' : 'Upgrade to Pro - $4.99/month'}
            </button>
          </div>

          {/* Yearly Pro Plan */}
          <div style={{
            padding: '1.5rem',
            border: '1px solid #FF3366',
            borderRadius: '12px',
            backgroundColor: '#FFF2F2'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Yearly Pro Plan</h3>
            <div style={{
              backgroundColor: '#FF3366',
              color: 'white',
              padding: '0.25rem 0.5rem',
              borderRadius: '12px',
              display: 'inline-block',
              fontSize: '0.875rem',
              marginBottom: '1rem'
            }}>
              Save 17%
            </div>
            <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>100 scripts per month</p>
            <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Priority support</p>
            <p style={{ margin: '0 0 1rem 0', color: '#666' }}>Advanced features</p>
            <button
              onClick={() => handleUpgrade('yearly')}
              disabled={loading}
              style={{
                width: '100%',
                padding: '1rem',
                backgroundColor: '#FF3366',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              {loading ? 'Processing...' : 'Upgrade to Pro - $49.99/year'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 