import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const SUPPORT_EMAIL = 'support@scriptsea.com';
const LAST_UPDATED = 'May 2025';

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p style={{ color: '#888', fontSize: '0.85rem', margin: '0 0 2rem' }}>
              Last updated: {LAST_UPDATED}
            </p>

            <Section title="1. Introduction">
              ScriptSea (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is committed to protecting your personal information.
              This Privacy Policy explains what data we collect, how we use it, and the choices you have.
              By using ScriptSea, you agree to the practices described here.
            </Section>

            <Section title="2. Information We Collect">
              <p style={pStyle}>We collect only the data needed to provide and improve our service:</p>
              <ul style={ulStyle}>
                <li><strong>Account information</strong> — your email address and display name when you register.</li>
                <li><strong>Authentication data</strong> — managed securely via Supabase. We never store your raw password.</li>
                <li><strong>Usage data</strong> — the scripts you generate, platform and tone preferences, and feature usage patterns to help us improve ScriptSea.</li>
                <li><strong>Payment information</strong> — processed exclusively by Polar.sh. We do not store card numbers or billing details on our servers.</li>
                <li><strong>Device and log data</strong> — browser type, IP address, pages visited, and timestamps, collected automatically for security and performance monitoring.</li>
              </ul>
            </Section>

            <Section title="3. How We Use Your Information">
              <ul style={ulStyle}>
                <li>To create and manage your ScriptSea account.</li>
                <li>To generate AI-powered scripts on your behalf using the inputs you provide.</li>
                <li>To process subscription payments and manage your plan.</li>
                <li>To send you important service communications (e.g., billing receipts, account security alerts). We do not send marketing emails without your consent.</li>
                <li>To analyse aggregate usage and improve the product.</li>
                <li>To comply with legal obligations and protect our rights.</li>
              </ul>
            </Section>

            <Section title="4. Data Sharing">
              <p style={pStyle}>We do not sell your personal data. We share limited information only with:</p>
              <ul style={ulStyle}>
                <li><strong>Supabase</strong> — authentication and database hosting.</li>
                <li><strong>Polar.sh</strong> — payment processing.</li>
                <li><strong>OpenAI</strong> — to process your prompts and generate script content. Your prompts are sent to OpenAI&rsquo;s API in accordance with their usage policies.</li>
                <li><strong>Vercel</strong> — application hosting and edge delivery.</li>
                <li><strong>Legal authorities</strong> — if required by law or to protect the safety of our users.</li>
              </ul>
            </Section>

            <Section title="5. Cookies and Local Storage">
              ScriptSea uses browser local storage to cache your profile data for a faster experience on each visit.
              We also use analytics cookies (Google Analytics) to understand how users interact with the product.
              You may disable cookies in your browser settings, though some features may not function as expected.
            </Section>

            <Section title="6. Data Retention">
              We retain your account and usage data for as long as your account is active. If you delete your account,
              we will remove your personal data within 30 days, except where retention is required by law.
            </Section>

            <Section title="7. Your Rights">
              <p style={pStyle}>Depending on your location, you may have the right to:</p>
              <ul style={ulStyle}>
                <li>Access the personal data we hold about you.</li>
                <li>Request correction of inaccurate data.</li>
                <li>Request deletion of your account and associated data.</li>
                <li>Object to or restrict how we process your data.</li>
                <li>Export your data in a machine-readable format.</li>
              </ul>
              <p style={pStyle}>
                To exercise these rights, email us at{' '}
                <a href={`mailto:${SUPPORT_EMAIL}`} style={linkStyle}>{SUPPORT_EMAIL}</a>.
              </p>
            </Section>

            <Section title="8. Data Security">
              We use industry-standard measures including encryption in transit (TLS), row-level security on our database,
              and server-side-only admin credentials for any privileged operations. No system is completely secure,
              so we encourage you to use a strong, unique password for your account.
            </Section>

            <Section title="9. Children's Privacy">
              ScriptSea is not directed at children under 13. We do not knowingly collect personal data from anyone
              under 13. If you believe we have done so inadvertently, please contact us and we will delete that data immediately.
            </Section>

            <Section title="10. Changes to This Policy">
              We may update this Privacy Policy from time to time. We will notify you of significant changes via email
              or a prominent notice on our website. Your continued use of ScriptSea after changes are posted
              constitutes acceptance of the updated policy.
            </Section>

            <Section title="11. Contact">
              <p style={pStyle}>
                If you have questions or concerns about this policy or how we handle your data, please contact us:
              </p>
              <p style={{ ...pStyle, marginBottom: 0 }}>
                📧{' '}
                <a href={`mailto:${SUPPORT_EMAIL}`} style={linkStyle}>{SUPPORT_EMAIL}</a>
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
      {typeof children === 'string' ? (
        <p style={pStyle}>{children}</p>
      ) : (
        children
      )}
    </div>
  );
}

const pStyle = { color: '#555', lineHeight: 1.75, margin: '0 0 0.6rem', fontSize: '0.95rem' };
const ulStyle = { color: '#555', lineHeight: 1.75, paddingLeft: '1.4rem', margin: '0.3rem 0 0.6rem', fontSize: '0.95rem' };
const linkStyle = { color: '#FF3366', textDecoration: 'none' };
