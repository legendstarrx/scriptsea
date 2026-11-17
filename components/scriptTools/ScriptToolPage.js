import React from 'react';
import Link from 'next/link';
import Navigation from '../Navigation';
import Footer from '../Footer';
import SEO from '../SEO';
import { useAuth } from '../../context/AuthContext';
import { SITE_URL, webApplicationJsonLd, faqJsonLd, breadcrumbJsonLd } from '../../lib/seo';
import ScriptTool from './ScriptTool';

// Same look as the existing script tool pages (pages/[tool].js), with a working
// generator in the hero instead of a sign-up button.
const card = {
  background: '#fff', borderRadius: '20px', padding: '32px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
};
const eyebrow = { color: '#FF3366', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' };
const h2 = { fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, color: '#111', marginBottom: '40px' };

// "**bold**" → <strong>
function withBold(text) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <strong key={i} style={{ color: '#111' }}>{part}</strong> : part));
}

export default function ScriptToolPage({ slug, page, related, maxInput, dailyLimit }) {
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
        ogImage={`${SITE_URL}/og/tools/${slug}.jpg`}
        jsonLd={[
          webApplicationJsonLd({ name: `Free ${page.navLabel}`, description: page.description, path }),
          faqJsonLd(page.faqs),
          breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Free Tools', path: '/tools' }, { name: page.navLabel, path }]),
        ]}
      />
      <Navigation />

      <main style={{ flex: '1', paddingTop: '37px', display: 'flex', flexDirection: 'column' }}>

        {/* ── HERO + TOOL ──────────────────────────────────────────── */}
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
            <div style={{ maxWidth: '720px', margin: '0 auto' }}>
              <ScriptTool
                slug={slug}
                kind={page.kind}
                inputLabel={page.inputLabel}
                placeholder={page.placeholder}
                button={page.button}
                lengths={page.lengths}
                defaultLength={page.defaultLength}
                maxInput={maxInput}
                dailyLimit={dailyLimit}
              />
            </div>
          </div>
        </section>

        {/* ── WHAT IT'S FOR ────────────────────────────────────────── */}
        <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1rem', background: '#fff' }}>
          <div style={{ maxWidth: '760px', margin: '0 auto' }}>
            <p style={eyebrow}>What It&apos;s For</p>
            <h2 style={{ ...h2, marginBottom: '20px' }}>{page.whatFor.title}</h2>
            {page.whatFor.body.map((p, i) => (
              <p key={i} style={{ color: '#555', fontSize: '1.05rem', lineHeight: 1.75, margin: '0 0 16px' }}>{withBold(p)}</p>
            ))}
          </div>
        </section>

        {/* ── EXAMPLE OPENINGS ─────────────────────────────────────── */}
        <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1rem', background: '#fafafa' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={eyebrow}>Real Examples</p>
              <h2 style={h2}>{page.examplesTitle}</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              {page.examples.map((ex) => (
                <div key={ex.label} style={{ ...card, padding: '24px' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FF3366', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>{ex.label}</p>
                  <p style={{ margin: 0, color: '#111', fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.5 }}>&ldquo;{ex.text}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TIPS ─────────────────────────────────────────────────── */}
        <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1rem', background: '#fff' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={eyebrow}>Quick Guide</p>
              <h2 style={h2}>{page.tipsTitle}</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              {page.tips.map((t) => (
                <div key={t.title} style={{ ...card, padding: '24px', background: '#fafafa', boxShadow: 'none' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111', marginBottom: '8px' }}>{t.title}</h3>
                  <p style={{ color: '#666', fontSize: '0.93rem', lineHeight: 1.65, margin: 0 }}>{t.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────── */}
        <section id="faq" style={{ padding: 'clamp(3rem, 6vw, 5rem) 1rem', background: '#fafafa' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <h2 style={{ ...h2, fontSize: 'clamp(1.4rem, 3.5vw, 1.8rem)', textAlign: 'center', marginBottom: '36px' }}>
              Questions? We Got You.
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {page.faqs.map((faq, i) => (
                <div key={faq.q} onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ background: '#fff', borderRadius: '14px', cursor: 'pointer' }}>
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

        {/* ── RELATED TOOLS ────────────────────────────────────────── */}
        <section style={{ padding: 'clamp(2.5rem, 5vw, 4rem) 1rem', background: '#fff' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ ...h2, fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', marginBottom: '24px' }}>Related Tools</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
              {related.map((r) => (
                <Link key={r.slug} href={`/${r.slug}`} style={{
                  background: '#fff', color: '#FF3366', textDecoration: 'none', fontWeight: 600, fontSize: '0.92rem',
                  padding: '10px 18px', borderRadius: '50px', border: '1px solid #FFE5EC',
                }}>
                  {r.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA (same as the existing script pages) ────────── */}
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
