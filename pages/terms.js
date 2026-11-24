import { Children } from 'react';
import Link from 'next/link';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

const SUPPORT_EMAIL = 'support@scriptsea.com';
const LAST_UPDATED = 'November 2026';

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SEO
        title="Terms of Service | ScriptSea"
        description="The terms for using ScriptSea, our free tools and our blog: accounts, plans, acceptable use and the content you create."
        path="/terms"
      />
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
              Terms of Service
            </h1>
            <p style={{ color: '#888', fontSize: '0.85rem', margin: '0 0 2rem' }}>
              Last updated: {LAST_UPDATED}
            </p>

            <Section title="1. About these terms">
              These terms apply when you use scriptsea.com, including the ScriptSea app, our free tools and our blog
              (together, the &ldquo;Service&rdquo;). By using the Service, you agree to these terms. If you don&rsquo;t agree,
              please don&rsquo;t use it.
            </Section>

            <Section title="2. Who can use ScriptSea">
              You must be at least 13 years old to use ScriptSea, and old enough to agree to these terms where you live.
              If you use ScriptSea for a business, you confirm you&rsquo;re allowed to accept these terms for that business.
            </Section>

            <Section title="3. Your account">
              <ul style={ulStyle}>
                <li>Give accurate details when you sign up and keep your login safe.</li>
                <li>You&rsquo;re responsible for what happens under your account.</li>
                <li>Tell us straight away at <a href={`mailto:${SUPPORT_EMAIL}`} style={linkStyle}>{SUPPORT_EMAIL}</a> if you think someone else has used it.</li>
              </ul>
            </Section>

            <Section title="4. Plans, payments and refunds">
              <p style={pStyle}>
                New accounts get a small number of free scripts. Paid plans are billed weekly or monthly in advance through
                our payment provider, Polar.sh, and renew automatically until you cancel. You can cancel at any time, and you
                keep access until the end of the period you paid for.
              </p>
              <p style={pStyle}>
                Current prices and limits are shown on our <Link href="/pricing" style={linkStyle}>pricing page</Link>. Refunds are
                covered by our <Link href="/refund" style={linkStyle}>refund policy</Link>.
              </p>
            </Section>

            <Section title="5. The content you create">
              <ul style={ulStyle}>
                <li>You own the ideas you put in and the scripts and prompts you get out, as far as the law allows.</li>
                <li>You give us permission to process your inputs only so we can run and improve the Service.</li>
                <li>
                  AI can make mistakes. Check scripts and prompts before you publish them, especially facts, claims about
                  products and anything involving health, money or the law.
                </li>
                <li>
                  You&rsquo;re responsible for how you use what you create, including following the rules of the platforms you
                  post on and advertising laws where you run ads.
                </li>
              </ul>
            </Section>

            <Section title="6. Acceptable use">
              <p style={pStyle}>Please don&rsquo;t use ScriptSea to:</p>
              <ul style={ulStyle}>
                <li>Break the law or anyone else&rsquo;s rights, including copyright and privacy.</li>
                <li>Create content that harasses, threatens, deceives or impersonates real people.</li>
                <li>Make fake reviews or testimonials, or misleading claims about products or services.</li>
                <li>Create sexual content involving minors, or content that promotes violence or self-harm.</li>
                <li>Scrape, overload, resell or try to get around the limits or security of the Service.</li>
              </ul>
              <p style={pStyle}>We may suspend or close accounts that break these rules.</p>
            </Section>

            <Section title="7. Our content">
              The ScriptSea name, logo, website design, software and blog articles belong to ScriptSea. You&rsquo;re welcome to
              share links to our articles, but please don&rsquo;t copy them in full without permission.
            </Section>

            <Section title="8. Blog and free tools">
              Our blog articles and free tools are for general information and education. They aren&rsquo;t professional,
              legal or financial advice. Platform rules and AI tools change often, so check the official sources before you
              rely on any detail. Our blog may show ads from Google AdSense, as explained in our{' '}
              <Link href="/privacy" style={linkStyle}>privacy policy</Link>.
            </Section>

            <Section title="9. Third-party services">
              ScriptSea links to and works alongside other services, like AI video tools and social platforms. We don&rsquo;t
              control them and aren&rsquo;t responsible for their content, rules or availability.
            </Section>

            <Section title="10. Changes and availability">
              We keep improving ScriptSea, so features may change. We aim to keep the Service running smoothly but can&rsquo;t
              promise it will always be available or error-free. If we make important changes to these terms, we&rsquo;ll
              update the date above and, where it makes sense, let you know by email.
            </Section>

            <Section title="11. Disclaimer and liability">
              The Service is provided &ldquo;as is&rdquo;. As far as the law allows, ScriptSea isn&rsquo;t liable for indirect
              or unexpected losses, like lost profits or lost data, and our total liability to you is limited to the amount you
              paid us in the 3 months before the claim. Nothing in these terms limits rights you have under consumer law that
              can&rsquo;t be limited.
            </Section>

            <Section title="12. Ending your use">
              You can stop using ScriptSea and delete your account at any time. We may suspend or end access if you break these
              terms or if we need to for legal reasons.
            </Section>

            <Section title="13. Contact">
              <p style={{ ...pStyle, marginBottom: 0 }}>
                Questions about these terms? Email us at{' '}
                <a href={`mailto:${SUPPORT_EMAIL}`} style={linkStyle}>{SUPPORT_EMAIL}</a>{' '}
                or visit our <Link href="/contact" style={linkStyle}>contact page</Link>.
              </p>
            </Section>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '1.8rem' }}>
      <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1a1a1a', margin: '0 0 0.6rem' }}>
        {title}
      </h2>
      {Children.toArray(children).some((c) => c && (c.type === 'ul' || c.type === 'p')) ? children : <p style={pStyle}>{children}</p>}
    </div>
  );
}

const pStyle = { color: '#555', lineHeight: 1.75, margin: '0 0 0.6rem', fontSize: '0.95rem' };
const ulStyle = { color: '#555', lineHeight: 1.75, paddingLeft: '1.4rem', margin: '0.3rem 0 0.6rem', fontSize: '0.95rem' };
const linkStyle = { color: '#FF3366', textDecoration: 'none' };
