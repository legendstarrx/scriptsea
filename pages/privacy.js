import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navigation />
      <main
        style={{
          flex: 1,
          background: 'linear-gradient(135deg, #fff5f7 0%, #ffffff 100%)',
          padding: '92px 1rem 3rem'
        }}
      >
        <section style={{ maxWidth: '920px', margin: '0 auto' }}>
          <div style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)', padding: '2rem' }}>
            <h1 style={{ margin: '0 0 1rem', fontSize: 'clamp(1.8rem, 5vw, 2.4rem)' }}>Privacy Policy</h1>
            <p style={{ color: '#5b5b5b', lineHeight: 1.7 }}>
              We collect only the data needed to operate ScriptSea, including account and billing details.
              We do not sell your personal data.
            </p>
            <p style={{ color: '#5b5b5b', lineHeight: 1.7 }}>
              Your generated content and account usage are processed to deliver and improve the service.
              For support requests, contact support@scriptsea.com.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
