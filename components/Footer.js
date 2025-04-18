import { useState } from 'react';
import PricingModal from './PricingModal';
import PrivacyModal from './PrivacyModal';
import AboutModal from './AboutModal';

const Footer = () => {
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      width: '100%',
      padding: '2rem 1rem',
      background: '#fff',
      borderTop: '1px solid rgba(255, 51, 102, 0.1)',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'flex',
          gap: '2rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setShowPricingModal(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#666',
              fontSize: '0.9rem',
              cursor: 'pointer',
              padding: 0,
              ':hover': {
                color: '#FF3366'
              }
            }}
          >
            Pricing
          </button>
          <button
            onClick={() => setShowPrivacyModal(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#666',
              fontSize: '0.9rem',
              cursor: 'pointer',
              padding: 0,
              ':hover': {
                color: '#FF3366'
              }
            }}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setShowAboutModal(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#666',
              fontSize: '0.9rem',
              cursor: 'pointer',
              padding: 0,
              ':hover': {
                color: '#FF3366'
              }
            }}
          >
            About Us
          </button>
        </div>
        <div style={{
          color: '#999',
          fontSize: '0.8rem'
        }}>
          © {currentYear} ScriptSea. All rights reserved.
        </div>
      </div>

      <PricingModal 
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
      />
      <PrivacyModal 
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
      <AboutModal 
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
      />
    </footer>
  );
};

export default Footer; 