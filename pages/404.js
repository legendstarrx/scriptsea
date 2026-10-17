import Link from 'next/link';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SEO title="Page Not Found | ScriptSea" description="This page doesn't exist." path="/404" noindex />
      <Navigation />
      <main style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        padding: '120px 1rem 4rem', background: 'linear-gradient(135deg, #fff5f7 0%, #ffffff 50%, #fff5f7 100%)',
      }}>
        <div style={{ maxWidth: '520px' }}>
          <p style={{ color: '#FF3366', fontWeight: 800, fontSize: '3.5rem', margin: '0 0 8px' }}>404</p>
          <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 800, color: '#111', margin: '0 0 12px' }}>
            This page went off script.
          </h1>
          <p style={{ color: '#666', fontSize: '1.05rem', lineHeight: 1.6, margin: '0 0 28px' }}>
            The link might be old or mistyped. Let&apos;s get you back to making videos.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" style={{
              background: 'linear-gradient(135deg,#FF3366,#ff6b8a)', color: '#fff', textDecoration: 'none',
              padding: '14px 28px', borderRadius: '12px', fontWeight: 700,
            }}>Go to homepage</Link>
            <Link href="/ai-script-generator" style={{
              background: '#FFE5EC', color: '#FF3366', textDecoration: 'none',
              padding: '14px 28px', borderRadius: '12px', fontWeight: 700,
            }}>Write a script</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
