import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const WHATSAPP_NUMBER = '447474762495'; // international format without +

export default function ContactPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navigation />
      <main style={{
        flex: 1,
        background: 'linear-gradient(135deg, #fff5f7 0%, #ffffff 100%)',
        padding: '92px 1rem 3rem',
      }}>
        <section style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.07)',
            padding: 'clamp(1.5rem, 4vw, 2.5rem)',
          }}>
            <p style={{ margin: 0, color: '#FF3366', fontWeight: 600, letterSpacing: '0.02em', fontSize: '0.85rem' }}>
              Contact
            </p>
            <h1 style={{ margin: '0.5rem 0 0.5rem', fontSize: 'clamp(1.6rem, 5vw, 2rem)', color: '#1a1a1a' }}>
              We&rsquo;re here to help
            </h1>
            <p style={{ color: '#666', lineHeight: 1.7, marginBottom: '2rem', fontSize: '0.95rem' }}>
              Send us a message and we&rsquo;ll get back to you as quickly as possible.
            </p>

            <div style={{ display: 'grid', gap: '12px' }}>
              {/* Email */}
              <a
                href="mailto:support@scriptsea.com"
                style={contactCardStyle}
              >
                <div style={iconWrap('#fff0f3')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF3366" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#1a1a1a', fontSize: '0.95rem' }}>Email Support</div>
                  <div style={{ color: '#FF3366', marginTop: '2px', fontSize: '0.9rem' }}>support@scriptsea.com</div>
                </div>
              </a>

              {/* WhatsApp */}
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                style={contactCardStyle}
              >
                <div style={iconWrap('#f0fff4')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#1a1a1a', fontSize: '0.95rem' }}>WhatsApp</div>
                  <div style={{ color: '#25D366', marginTop: '2px', fontSize: '0.9rem' }}>Chat with our team</div>
                </div>
              </a>
            </div>

            <p style={{ color: '#aaa', fontSize: '0.8rem', textAlign: 'center', marginTop: '2rem', marginBottom: 0 }}>
              Typical response time: within 24 hours
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

const contactCardStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  textDecoration: 'none',
  border: '1.5px solid #f3d5de',
  borderRadius: '14px',
  padding: '14px 16px',
  color: '#252525',
  transition: 'all .2s ease',
  background: '#fff',
};

function iconWrap(bg) {
  return {
    width: '42px', height: '42px', borderRadius: '10px',
    background: bg, display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0,
  };
}
