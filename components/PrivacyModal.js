import { useState } from 'react';

export default function PrivacyModal({ isOpen, onClose }) {
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
        maxWidth: '800px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h2 style={{ color: '#FF3366', marginBottom: '1.5rem' }}>Privacy Policy</h2>
        <div style={{ color: '#666', lineHeight: '1.6' }}>
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <h3 style={{ color: '#333', marginTop: '1rem' }}>1. Information We Collect</h3>
          <p>We collect information that you provide directly to us, including your email address, name, and payment information when you create an account or make a purchase.</p>
          
          <h3 style={{ color: '#333', marginTop: '1rem' }}>2. How We Use Your Information</h3>
          <p>We use the information we collect to provide, maintain, and improve our services, process your transactions, and communicate with you.</p>
          
          <h3 style={{ color: '#333', marginTop: '1rem' }}>3. Data Security</h3>
          <p>We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.</p>
          
          <h3 style={{ color: '#333', marginTop: '1rem' }}>4. Your Rights</h3>
          <p>You have the right to access, correct, or delete your personal information. You can do this through your account settings or by contacting us.</p>
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