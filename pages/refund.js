import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

export default function RefundPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navigation />
      <main style={{
        flex: 1,
        background: 'linear-gradient(135deg, #fff5f7 0%, #ffffff 100%)',
        padding: '92px 1rem 3rem',
      }}>
        <section style={{ maxWidth: '760px', margin: '0 auto' }}>
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.07)',
            padding: 'clamp(1.5rem, 4vw, 2.5rem)',
          }}>
            <p style={{ margin: 0, color: '#FF3366', fontWeight: 600, letterSpacing: '0.02em', fontSize: '0.85rem' }}>
              Legal
            </p>
            <h1 style={{ margin: '0.5rem 0 0.4rem', fontSize: 'clamp(1.6rem, 5vw, 2.2rem)', color: '#1a1a1a' }}>
              Refund Policy
            </h1>
            <p style={{ color: '#888', fontSize: '0.85rem', margin: '0 0 2rem' }}>
              Last updated: May 2025
            </p>

            <div style={sectionStyle}>
              <h2 style={h2Style}>Our Commitment</h2>
              <p style={pStyle}>
                We want you to be fully satisfied with ScriptSea. If something went wrong with your purchase,
                we are here to make it right.
              </p>
            </div>

            <div style={sectionStyle}>
              <h2 style={h2Style}>Eligibility for a Refund</h2>
              <p style={pStyle}>You may be eligible for a refund if:</p>
              <ul style={ulStyle}>
                <li>You were charged in error or experienced a billing issue.</li>
                <li>You experienced a technical problem that prevented you from using the service, and our team was unable to resolve it.</li>
                <li>You request a refund within <strong>7 days</strong> of your purchase date.</li>
              </ul>
            </div>

            <div style={sectionStyle}>
              <h2 style={h2Style}>Non-Refundable Situations</h2>
              <ul style={ulStyle}>
                <li>Requests made more than 7 days after the billing date.</li>
                <li>Partial use of the subscription period.</li>
                <li>Change of mind after scripts have already been generated.</li>
              </ul>
            </div>

            <div style={sectionStyle}>
              <h2 style={h2Style}>How to Request a Refund</h2>
              <p style={pStyle}>
                Email us at{' '}
                <a href="mailto:support@scriptsea.com" style={linkStyle}>support@scriptsea.com</a>{' '}
                within 7 days of your purchase. Please include your account email address and a brief description
                of the issue. We will respond within 24 hours.
              </p>
            </div>

            <div style={sectionStyle}>
              <h2 style={h2Style}>Processing Time</h2>
              <p style={pStyle}>
                Approved refunds are returned to the original payment method. Processing times vary by provider
                but typically take 5–10 business days to appear on your statement.
              </p>
            </div>

            <div style={{ ...sectionStyle, marginBottom: 0 }}>
              <h2 style={h2Style}>Questions?</h2>
              <p style={{ ...pStyle, marginBottom: 0 }}>
                Contact us at{' '}
                <a href="mailto:support@scriptsea.com" style={linkStyle}>support@scriptsea.com</a>.
                We are happy to help.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

const sectionStyle = { marginBottom: '1.8rem' };
const h2Style = { fontSize: '1.05rem', fontWeight: 700, color: '#1a1a1a', margin: '0 0 0.6rem' };
const pStyle = { color: '#555', lineHeight: 1.75, margin: '0 0 0.6rem', fontSize: '0.95rem' };
const ulStyle = { color: '#555', lineHeight: 1.75, paddingLeft: '1.4rem', margin: '0.3rem 0 0.6rem', fontSize: '0.95rem' };
const linkStyle = { color: '#FF3366', textDecoration: 'none' };
