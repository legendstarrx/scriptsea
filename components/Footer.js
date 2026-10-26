import Link from 'next/link';

// Every public page is linked from here so search engines can find and rank them.
const TOOL_LINKS = [
  { href: '/ai-script-generator', label: 'AI Script Generator' },
  { href: '/ai-video-prompt-generator', label: 'AI Video Prompt Generator' },
  { href: '/youtube-script-generator', label: 'YouTube Script Generator' },
  { href: '/tiktok-script-generator', label: 'TikTok Script Generator' },
  { href: '/ugc-ad-script-generator', label: 'UGC Ad Script Generator' },
];

const MODEL_LINKS = [
  { href: '/seedance-prompt-generator', label: 'Seedance Prompt Generator' },
  { href: '/kling-prompt-generator', label: 'Kling Prompt Generator' },
  { href: '/veo-prompt-generator', label: 'Veo Prompt Generator' },
  { href: '/sora-prompt-generator', label: 'Sora Prompt Generator' },
];

const COMPANY_LINKS = [
  { href: '/tools', label: 'Free Tools' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/refund', label: 'Refund Policy' },
];

const linkStyle = { color: '#666', textDecoration: 'none', fontSize: '.9rem', lineHeight: 2 };
const headingStyle = { color: '#111', fontSize: '.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' };

function Column({ title, links }) {
  return (
    <div>
      <p style={headingStyle}>{title}</p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} style={linkStyle}>{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        width: '100%',
        padding: '2.5rem 1rem 2rem',
        background: '#fff',
        borderTop: '1px solid rgba(255, 51, 102, 0.1)',
        marginTop: 'auto'
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.75rem',
            marginBottom: '2rem'
          }}
        >
          <div>
            <Link href="/" style={{ color: '#FF3366', fontSize: '1.3rem', fontWeight: 800, textDecoration: 'none' }}>
              ScriptSea
            </Link>
            <p style={{ color: '#888', fontSize: '.88rem', lineHeight: 1.6, margin: '8px 0 0', maxWidth: '240px' }}>
              Viral video scripts and AI video prompts for Seedance, Kling, Veo and Sora. In seconds.
            </p>
          </div>
          <Column title="Tools" links={TOOL_LINKS} />
          <Column title="AI Video Models" links={MODEL_LINKS} />
          <Column title="Company" links={COMPANY_LINKS} />
        </div>
        <div style={{ color: '#999', fontSize: '.8rem', textAlign: 'center' }}>© {currentYear} ScriptSea. All rights reserved.</div>
      </div>
    </footer>
  );
};

export default Footer;
