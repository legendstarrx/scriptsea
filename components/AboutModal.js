import { useState } from 'react';

export default function AboutModal({ isOpen, onClose }) {
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
        <h2 style={{ color: '#FF3366', marginBottom: '1.5rem' }}>About ScriptSea</h2>
        <div style={{ color: '#666', lineHeight: '1.6' }}>
          <p>ScriptSea is a powerful platform designed to help content creators, marketers, and businesses generate high-quality scripts for various purposes.</p>
          
          <h3 style={{ color: '#333', marginTop: '1rem' }}>Our Mission</h3>
          <p>To empower creators with the tools they need to produce engaging and effective content through AI-powered script generation.</p>
          
          <h3 style={{ color: '#333', marginTop: '1rem' }}>Features</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>✓ AI-powered script generation</li>
            <li>✓ Multiple script formats</li>
            <li>✓ Customizable templates</li>
            <li>✓ Easy-to-use interface</li>
          </ul>
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