import React from 'react';
import Link from 'next/link';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';
import { TOOL_PAGES, TOOL_SLUGS } from '../lib/toolPages';
import { FREE_TOOL_SLUGS } from '../lib/freeTools/config';
import { softwareJsonLd, faqJsonLd, breadcrumbJsonLd, VIDEO_MODELS } from '../lib/seo';

const card = {
  background: '#fff', borderRadius: '20px', padding: '32px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
};
const eyebrow = { color: '#FF3366', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' };
const h2 = { fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, color: '#111', marginBottom: '40px' };
const primaryCta = {
  background: 'linear-gradient(135deg,#FF3366,#ff6b8a)', color: 'white', textDecoration: 'none',
  padding: '16px 40px', borderRadius: '14px', fontSize: '1.1rem', fontWeight: 700,
  boxShadow: '0 8px 30px rgba(255,51,102,0.3)', display: 'inline-flex', alignItems: 'center', gap: '10px',
};

export default function ToolPage({ slug }) {
  const page = TOOL_PAGES[slug];
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = React.useState(null);
  const ctaHref = user ? '/generate' : '/register';
  const path = `/${slug}`;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SEO
        title={page.title}
        description={page.description}
        path={path}
        jsonLd={[
          softwareJsonLd({ name: `ScriptSea ${page.navLabel}`, description: page.description, path }),
          faqJsonLd(page.faqs),
          breadcrumbJsonLd([{ name: 'ScriptSea', path: '/' }, { name: page.navLabel, path }]),
        ]}
      />
      <Navigation />

      <main style={{ flex: '1', paddingTop: '37px', display: 'flex', flexDirection: 'column' }}>

        {/* ── HERO ─────────────────────────────────────────────────── */}
        <section style={{
          background: 'linear-gradient(135deg, #fff5f7 0%, #ffffff 50%, #fff5f7 100%)',
          padding: 'clamp(3rem, 8vw, 6rem) 1rem clamp(2rem, 6vw, 4rem)', textAlign: 'center',
        }}>
          <div style={{ maxWidth: '820px', margin: '0 auto' }}>
            <div style={{
              display: 'inline-block', background: '#FFE5EC', color: '#FF3366',
              padding: '6px 18px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '24px',
            }}>
              {page.badge}
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 5.5vw, 3.2rem)', fontWeight: 800, color: '#111', lineHeight: 1.15, marginBottom: '20px' }}>
              {page.h1.before}<span style={{ color: '#FF3366' }}>{page.h1.highlight}</span>{page.h1.after}
            </h1>
            <p style={{ fontSize: 'clamp(1rem, 2.2vw, 1.18rem)', color: '#555', lineHeight: 1.7, maxWidth: '640px', margin: '0 auto 32px' }}>
              {page.intro}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <Link href={ctaHref} style={primaryCta}>
                Try It Free <span style={{ fontSize: '1.3rem' }}>→</span>
              </Link>
              <p style={{ fontSize: '0.82rem', color: '#999' }}>3 free scripts. No credit card.</p>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
        <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1rem', background: '#fff' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
            <p style={eyebrow}>How It Works</p>
            <h2 style={{ ...h2, marginBottom: '48px' }}>Three Steps. About a Minute.</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', textAlign: 'left' }}>
              {page.steps.map((s, i) => (
                <div key={i} style={{ ...card, position: 'relative', paddingTop: '40px' }}>
                  <div style={{
                    position: 'absolute', top: '-16px', left: '24px', background: '#FF3366', color: 'white',
                    width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, boxShadow: '0 4px 12px rgba(255,51,102,0.3)',
                  }}>{`0${i + 1}`}</div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111', marginBottom: '8px' }}>{s.title}</h3>
                  <p style={{ color: '#666', lineHeight: 1.65, fontSize: '0.95rem', margin: 0 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── EXAMPLE ──────────────────────────────────────────────── */}
        <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1rem', background: '#fafafa' }}>
          <div style={{ maxWidth: '820px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={eyebrow}>Real Example</p>
              <h2 style={h2}>See What You Get</h2>
            </div>
            <div style={{ ...card, padding: '24px', marginBottom: '16px' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>{page.example.inputLabel}</p>
              <p style={{ margin: 0, color: '#111', fontSize: '1rem', fontWeight: 500 }}>{page.example.input}</p>
            </div>
            <div style={{ ...card, padding: '24px', border: '2px solid #FF3366' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FF3366', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>{page.example.outputLabel}</p>
              <p style={{ margin: 0, color: '#333', fontSize: '0.95rem', lineHeight: 1.75, whiteSpace: 'pre-line' }}>{page.example.output}</p>
            </div>
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────────────────── */}
        <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1rem', background: '#fff' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <p style={eyebrow}>What You Get</p>
            <h2 style={h2}>Built for One Job. Does It Well.</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', textAlign: 'left' }}>
              {page.features.map((f, i) => (
                <div key={i} style={{ padding: '18px 20px', background: '#fafafa', borderRadius: '14px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ color: '#FF3366', fontWeight: 800, flexShrink: 0 }}>✓</span>
                  <span style={{ color: '#333', fontSize: '0.95rem', lineHeight: 1.5 }}>{f}</span>
                </div>
              ))}
            </div>
            <p style={{ marginTop: '32px', color: '#888', fontSize: '0.9rem' }}>
              Works with {VIDEO_MODELS.join(', ')} and Higgsfield.
            </p>
          </div>
        </section>

        {/* ── TIPS (informational content) ─────────────────────────── */}
        <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1rem', background: '#fafafa' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={eyebrow}>Quick Guide</p>
              <h2 style={h2}>{page.tipsTitle}</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              {page.tips.map((t, i) => (
                <div key={i} style={{ ...card, padding: '24px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111', marginBottom: '8px' }}>{t.title}</h3>
                  <p style={{ color: '#666', fontSize: '0.93rem', lineHeight: 1.65, margin: 0 }}>{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────── */}
        <section id="faq" style={{ padding: 'clamp(3rem, 6vw, 5rem) 1rem', background: '#fff' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <h2 style={{ ...h2, fontSize: 'clamp(1.4rem, 3.5vw, 1.8rem)', textAlign: 'center', marginBottom: '36px' }}>
              Questions? We Got You.
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {page.faqs.map((faq, i) => (
                <div key={i} onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
                  background: '#fafafa', borderRadius: '14px', cursor: 'pointer',
                }}>
                  <div style={{ padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                    <h3 style={{ fontSize: '1rem', color: '#222', fontWeight: 600, margin: 0 }}>{faq.q}</h3>
                    <div style={{ color: '#FF3366', transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s', flexShrink: 0 }}>▼</div>
                  </div>
                  {/* Answer stays in the HTML (just collapsed) so search engines can read it */}
                  <div style={{
                    padding: openFaq === i ? '0 20px 18px' : '0 20px',
                    maxHeight: openFaq === i ? '300px' : '0', overflow: 'hidden',
                    transition: 'all 0.3s', opacity: openFaq === i ? 1 : 0,
                  }}>
                    <p style={{ color: '#666', lineHeight: 1.65, margin: 0, fontSize: '0.93rem' }}>{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── RELATED TOOLS (internal links) ───────────────────────── */}
        <section style={{ padding: 'clamp(2.5rem, 5vw, 4rem) 1rem', background: '#fafafa' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ ...h2, fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', marginBottom: '24px' }}>More Free Tools</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
              {page.related.map((s) => (
                <Link key={s} href={`/${s}`} style={{
                  background: '#fff', color: '#FF3366', textDecoration: 'none', fontWeight: 600, fontSize: '0.92rem',
                  padding: '10px 18px', borderRadius: '50px', border: '1px solid #FFE5EC',
                }}>
                  {TOOL_PAGES[s].navLabel}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ────────────────────────────────────────────── */}
        <section style={{ padding: 'clamp(3rem, 7vw, 5rem) 1rem', background: 'linear-gradient(135deg, #FF3366 0%, #ff6b8a 100%)', textAlign: 'center' }}>
          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, color: 'white', marginBottom: '16px', lineHeight: 1.2 }}>
              Your Next Video Is One Click Away.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.05rem', marginBottom: '32px', lineHeight: 1.6 }}>
              Try it on your own idea. If it doesn&apos;t beat what you&apos;d write yourself, you&apos;ve lost nothing.
            </p>
            <Link href={ctaHref} style={{
              background: 'white', color: '#FF3366', textDecoration: 'none', display: 'inline-block',
              padding: '16px 40px', borderRadius: '14px', fontSize: '1.1rem', fontWeight: 700,
              boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
            }}>
              Get My 3 Free Scripts →
            </Link>
            <p style={{ marginTop: '12px', fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)' }}>No credit card required</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export async function getStaticPaths() {
  return { paths: TOOL_SLUGS.filter((s) => !FREE_TOOL_SLUGS.includes(s)).map((tool) => ({ params: { tool } })), fallback: false };
}

export async function getStaticProps({ params }) {
  return { props: { slug: params.tool } };
}
