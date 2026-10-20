import React from 'react';
import Link from 'next/link';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';
import { softwareJsonLd, faqJsonLd } from '../lib/seo';

const TITLE = 'Pricing: Free AI Script & Video Prompt Generator | ScriptSea';
const DESCRIPTION =
  'Start free with 3 scripts. Pro is $4.99 a week for 15 scripts or $19.99 a month for 60. AI scripts and AI video prompts for Seedance, Kling, Veo and Sora.';

const PRO_FEATURES = [
  'Scripts from 15 seconds up to 60 minutes',
  'AI video prompts for Seedance, Kling, Veo & Sora',
  'All content formats and tones',
  'Creator style matching from any video link',
  'Export to PDF & Word',
  'Thumbnail suggestions',
  'Priority support',
];

const PLANS = [
  {
    name: 'Free', price: '$0', per: '', tagline: 'See it work on your own idea.',
    features: ['3 free scripts', '15 and 30 second scripts', 'See exactly how it works', 'No credit card'],
    cta: 'Start Free',
  },
  {
    name: 'Pro Weekly', price: '$4.99', per: '/week', tagline: 'For a busy week of posting.',
    features: ['15 scripts per week', ...PRO_FEATURES],
    cta: 'Get Pro Weekly',
  },
  {
    name: 'Pro Monthly', price: '$19.99', per: '/month', tagline: 'Best value. Post every single day.',
    features: ['60 scripts per month', ...PRO_FEATURES],
    cta: 'Get Pro Monthly', featured: true,
  },
];

const FAQS = [
  { q: 'What counts as one script?', a: 'On Pro, each generation counts as one, whether it is a script or a set of video prompts. Both use the same allowance.' },
  { q: 'Can I cancel?', a: 'Yes. Email support@scriptsea.com and we will cancel your plan. If something went wrong, you can ask for a refund within 7 days of purchase, as explained in our refund policy.' },
  { q: 'Do I need a card for the free plan?', a: 'No. Sign up with Google or email and you get 3 free scripts straight away.' },
  { q: 'Which plan should I pick?', a: 'If you post a few times a week, Weekly is enough. If you post daily or test lots of ad hooks, Monthly gives you 4 times the scripts for the best price.' },
];

export default function PricingPage() {
  const { user } = useAuth();
  const href = user ? '/generate' : '/register';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SEO
        title={TITLE}
        description={DESCRIPTION}
        path="/pricing"
        jsonLd={[softwareJsonLd({ name: 'ScriptSea', description: DESCRIPTION, path: '/pricing' }), faqJsonLd(FAQS)]}
      />
      <Navigation />
      <main style={{ flex: 1, paddingTop: '37px' }}>
        <section style={{
          background: 'linear-gradient(135deg, #fff5f7 0%, #ffffff 50%, #fff5f7 100%)',
          padding: 'clamp(3rem, 8vw, 5rem) 1rem clamp(2rem, 5vw, 3rem)', textAlign: 'center',
        }}>
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <div style={{
              display: 'inline-block', background: '#FFE5EC', color: '#FF3366',
              padding: '6px 18px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '20px',
            }}>Pricing</div>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, color: '#111', lineHeight: 1.15, margin: '0 0 16px' }}>
              Less Than a Coffee a Week. <span style={{ color: '#FF3366' }}>Way More Views.</span>
            </h1>
            <p style={{ color: '#555', fontSize: '1.1rem', lineHeight: 1.7, margin: 0 }}>
              Try 3 scripts free. Upgrade only when you&apos;re sure it works for you.
            </p>
          </div>
        </section>

        <section style={{ padding: '0 1rem clamp(3rem, 6vw, 5rem)', background: '#fff' }}>
          <div style={{
            maxWidth: '1040px', margin: '0 auto', display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', paddingTop: '32px',
          }}>
            {PLANS.map((p) => (
              <div key={p.name} style={{
                background: '#fff', borderRadius: '20px', padding: '32px', position: 'relative',
                border: p.featured ? '2px solid #FF3366' : '2px solid #f0f0f0',
                boxShadow: p.featured ? '0 12px 40px rgba(255,51,102,0.15)' : '0 4px 24px rgba(0,0,0,0.05)',
                display: 'flex', flexDirection: 'column',
              }}>
                {p.featured && (
                  <div style={{
                    position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
                    background: '#FF3366', color: '#fff', padding: '4px 14px', borderRadius: '50px',
                    fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap',
                  }}>BEST VALUE</div>
                )}
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111', margin: '0 0 4px' }}>{p.name}</h2>
                <p style={{ color: '#888', fontSize: '0.9rem', margin: '0 0 16px' }}>{p.tagline}</p>
                <p style={{ margin: '0 0 20px' }}>
                  <span style={{ fontSize: '2.4rem', fontWeight: 800, color: p.featured ? '#FF3366' : '#111' }}>{p.price}</span>
                  <span style={{ color: '#888', fontSize: '1rem' }}>{p.per}</span>
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', flex: 1 }}>
                  {p.features.map((f) => (
                    <li key={f} style={{ display: 'flex', gap: '10px', color: '#444', fontSize: '0.93rem', lineHeight: 1.5, marginBottom: '8px' }}>
                      <span style={{ color: '#FF3366', fontWeight: 800 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <Link href={href} style={{
                  display: 'block', textAlign: 'center', textDecoration: 'none', fontWeight: 700,
                  padding: '14px', borderRadius: '12px',
                  background: p.featured ? 'linear-gradient(135deg,#FF3366,#ff6b8a)' : '#FFE5EC',
                  color: p.featured ? '#fff' : '#FF3366',
                }}>
                  {p.cta} →
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1rem', background: '#fafafa' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(1.4rem, 3.5vw, 1.8rem)', textAlign: 'center', marginBottom: '28px', color: '#111', fontWeight: 800 }}>
              Pricing Questions
            </h2>
            {FAQS.map((f) => (
              <div key={f.q} style={{ background: '#fff', borderRadius: '14px', padding: '18px 20px', marginBottom: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                <h3 style={{ fontSize: '1rem', color: '#222', fontWeight: 600, margin: '0 0 6px' }}>{f.q}</h3>
                <p style={{ color: '#666', lineHeight: 1.65, margin: 0, fontSize: '0.93rem' }}>{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
