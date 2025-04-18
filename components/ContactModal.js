import { useState } from 'react';

export default function ContactModal({ isOpen, onClose }) {
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
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h2 style={{ color: '#FF3366', marginBottom: '1.5rem' }}>Contact Us</h2>
        <div style={{ color: '#666', lineHeight: '1.6' }}>
          <p>Have questions or need support? We're here to help!</p>
          <div style={{ marginTop: '1rem' }}>
            <p><strong>Email:</strong> support@scriptsea.com</p>
            <p><strong>Response Time:</strong> Within 24 hours</p>
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