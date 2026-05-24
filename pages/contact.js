import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const contactItems = [
  {
    title: 'Email Support',
    value: 'support@scriptsea.com',
    href: 'mailto:support@scriptsea.com'
  },
  {
    title: 'Billing & Payments',
    value: 'payments@scriptsea.com',
    href: 'mailto:payments@scriptsea.com'
  },
  {
    title: 'Partnerships',
    value: 'partners@scriptsea.com',
    href: 'mailto:partners@scriptsea.com'
  }
];

export default function ContactPage() {
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
          <div
            style={{
              background: '#fff',
              borderRadius: '20px',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
              padding: '2rem'
            }}
          >
            <p
              style={{
                margin: 0,
                color: '#FF3366',
                fontWeight: 600,
                letterSpacing: '0.02em'
              }}
            >
              Contact
            </p>
            <h1 style={{ margin: '0.75rem 0 1rem', fontSize: 'clamp(1.8rem, 5vw, 2.4rem)' }}>
              Need help with ScriptSea?
            </h1>
            <p style={{ color: '#5b5b5b', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              Send us a message and we will get back to you as quickly as possible.
            </p>

            <div style={{ display: 'grid', gap: '0.9rem' }}>
              {contactItems.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  style={{
                    textDecoration: 'none',
                    border: '1px solid #f3d5de',
                    borderRadius: '12px',
                    padding: '0.9rem 1rem',
                    color: '#252525',
                    transition: 'all .2s ease'
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{item.title}</div>
                  <div style={{ color: '#666', marginTop: '0.25rem' }}>{item.value}</div>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
