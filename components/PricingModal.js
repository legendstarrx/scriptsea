import { useState } from 'react';

export default function PricingModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '8px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h2 style={{ color: '#FF3366', marginBottom: '1.5rem' }}>Pricing Plans</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            border: '1px solid #FF3366',
            padding: '1rem',
            borderRadius: '8px'
          }}>
            <h3 style={{ color: '#333' }}>Free Plan</h3>
            <p style={{ color: '#666' }}>3 scripts per month</p>
            <p style={{ color: '#666' }}>Basic script generation</p>
            <p style={{ color: '#666' }}>Standard support</p>
            <p style={{ color: '#666' }}>Copy scripts to clipboard</p>
            <p style={{ color: '#666' }}>No credit card required</p>
            <p style={{ color: '#FF3366', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '0.5rem' }}>Free</p>
          </div>
          <div style={{
            border: '1px solid #FF3366',
            padding: '1rem',
            borderRadius: '8px'
          }}>
            <h3 style={{ color: '#333' }}>Pro Monthly</h3>
            <p style={{ color: '#666' }}>100 scripts per month</p>
            <p style={{ color: '#666' }}>Export to PDF & Word</p>
            <p style={{ color: '#666' }}>Save unlimited scripts</p>
            <p style={{ color: '#666' }}>Viral video analysis</p>
            <p style={{ color: '#666' }}>SEO optimization</p>
            <p style={{ color: '#666' }}>Thumbnail suggestions</p>
            <p style={{ color: '#666' }}>Creator style matching</p>
            <p style={{ color: '#666' }}>Priority support</p>
            <p style={{ color: '#666' }}>Cancel anytime</p>
            <p style={{ color: '#FF3366', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '0.5rem' }}>$4.99/month</p>
          </div>
          <div style={{
            border: '1px solid #FF3366',
            padding: '1rem',
            borderRadius: '8px'
          }}>
            <h3 style={{ color: '#333' }}>Pro Yearly</h3>
            <p style={{ color: '#666' }}>1200 scripts per year</p>
            <p style={{ color: '#666' }}>Export to PDF & Word</p>
            <p style={{ color: '#666' }}>Save unlimited scripts</p>
            <p style={{ color: '#666' }}>Viral video analysis</p>
            <p style={{ color: '#666' }}>SEO optimization</p>
            <p style={{ color: '#666' }}>Thumbnail suggestions</p>
            <p style={{ color: '#666' }}>Creator style matching</p>
            <p style={{ color: '#666' }}>Priority support</p>
            <p style={{ color: '#666' }}>2 months free</p>
            <p style={{ color: '#FF3366', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '0.5rem' }}>$49.99/year</p>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            marginTop: '1.5rem',
            padding: '0.5rem 1rem',
            background: '#FF3366',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
} 