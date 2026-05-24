import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

export default function AboutPage() {
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
              About ScriptSea
            </p>
            <h1 style={{ margin: '0.75rem 0 1rem', fontSize: 'clamp(1.8rem, 5vw, 2.4rem)' }}>
              We help creators turn ideas into high-performing scripts.
            </h1>
            <p style={{ color: '#5b5b5b', lineHeight: 1.7, fontSize: '1.05rem' }}>
              ScriptSea is built for creators who need speed without sacrificing quality. We combine
              practical script frameworks, platform-specific structure, and AI assistance so your
              first draft is useful in minutes.
            </p>
            <p style={{ color: '#5b5b5b', lineHeight: 1.7, fontSize: '1.05rem' }}>
              Our focus is simple: help you publish consistently, test better hooks, and keep your
              content output smooth as you scale.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
