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
            <p style={{ color: '#666' }}>Standard templates</p>
            <p style={{ color: '#666' }}>Community support</p>
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
            <p style={{ color: '#666' }}>Save & export scripts (PDF/Word)</p>
            <p style={{ color: '#666' }}>Viral video reference analysis</p>
            <p style={{ color: '#666' }}>Advanced SEO & hashtags</p>
            <p style={{ color: '#666' }}>Thumbnail ideas generator</p>
            <p style={{ color: '#666' }}>Premium script templates</p>
            <p style={{ color: '#666' }}>Creator style matching</p>
            <p style={{ color: '#666' }}>Priority email support</p>
            <p style={{ color: '#666' }}>Cancel anytime</p>
            <p style={{ color: '#FF3366', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '0.5rem' }}>$4.99/month</p>
          </div>
          <div style={{
            border: '1px solid #FF3366',
            padding: '1rem',
            borderRadius: '8px'
          }}>
            <h3 style={{ color: '#333' }}>Pro Yearly</h3>
            <p style={{ color: '#666' }}>1200 scripts per year (100/month)</p>
            <p style={{ color: '#666' }}>Save & export scripts (PDF/Word)</p>
            <p style={{ color: '#666' }}>Viral video reference analysis</p>
            <p style={{ color: '#666' }}>Advanced SEO & hashtags</p>
            <p style={{ color: '#666' }}>Thumbnail ideas generator</p>
            <p style={{ color: '#666' }}>Premium script templates</p>
            <p style={{ color: '#666' }}>Creator style matching</p>
            <p style={{ color: '#666' }}>Priority email support</p>
            <p style={{ color: '#666' }}>Guaranteed 24h response</p>
            <p style={{ color: '#666' }}>2 months free ($10 savings)</p>
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