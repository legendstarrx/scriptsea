import { useRouter } from 'next/router';
import Link from 'next/link';

const Footer = () => {
  const router = useRouter();
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
          <Link
            href="/pricing"
            style={{
              cursor: 'pointer',
              color: '#666',
              fontSize: '0.9rem',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
              ':hover': {
                color: '#FF3366'
              }
            }}
          >
            Pricing
          </Link>
          <Link
            href="/privacy"
            style={{
              cursor: 'pointer',
              color: '#666',
              fontSize: '0.9rem',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
              ':hover': {
                color: '#FF3366'
              }
            }}
          >
            Privacy Policy
          </Link>
        </div>
        <div style={{
          color: '#999',
          fontSize: '0.8rem'
        }}>
          © {currentYear} ScriptSea. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer; 