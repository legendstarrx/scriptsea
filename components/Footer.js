import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        width: '100%',
        padding: '2rem 1rem',
        background: '#fff',
        borderTop: '1px solid rgba(255, 51, 102, 0.1)',
        marginTop: 'auto'
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/about" style={{ color: '#666', textDecoration: 'none', fontSize: '.92rem' }}>
            About
          </Link>
          <Link href="/contact" style={{ color: '#666', textDecoration: 'none', fontSize: '.92rem' }}>
            Contact
          </Link>
          <Link href="/privacy" style={{ color: '#666', textDecoration: 'none', fontSize: '.92rem' }}>
            Privacy Policy
          </Link>
          <Link href="/refund" style={{ color: '#666', textDecoration: 'none', fontSize: '.92rem' }}>
            Refund Policy
          </Link>
        </div>
        <div style={{ color: '#999', fontSize: '.8rem' }}>© {currentYear} ScriptSea. All rights reserved.</div>
      </div>
    </footer>
  );
};

export default Footer;
