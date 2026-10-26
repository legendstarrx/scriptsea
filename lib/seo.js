// Single source of truth for SEO. The apex domain 308-redirects to www,
// so every canonical URL must use www or Google splits ranking signals.
export const SITE_URL = 'https://www.scriptsea.com';
export const SITE_NAME = 'ScriptSea';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
export const SUPPORT_EMAIL = 'support@scriptsea.com';

// The AI video models we name across the site. Update this list when the
// leaderboard shifts — it feeds the landing copy, FAQs and structured data.
export const VIDEO_MODELS = ['Seedance 2.0', 'Kling 3.0', 'Veo 3.1', 'Sora 2', 'Wan', 'Hailuo'];
export const VIDEO_MODELS_SHORT = ['Seedance', 'Kling', 'Veo', 'Sora', 'Wan', 'Hailuo'];

export const PLANS = [
  { name: 'Free', price: '0', period: null, scripts: '3 scripts to try it' },
  { name: 'Pro Weekly', price: '4.99', period: 'week', scripts: '15 scripts per week' },
  { name: 'Pro Monthly', price: '19.99', period: 'month', scripts: '60 scripts per month' },
];

export const absoluteUrl = (path = '/') => `${SITE_URL}${path === '/' ? '/' : path}`;

export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/android-chrome-512x512.png`,
  email: SUPPORT_EMAIL,
};

export const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: SITE_NAME,
  alternateName: ['ScriptSea AI', 'scriptsea.com'],
  url: `${SITE_URL}/`,
  publisher: { '@id': `${SITE_URL}/#organization` },
};

export function softwareJsonLd({ name, description, path }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    url: absoluteUrl(path),
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    publisher: { '@id': `${SITE_URL}/#organization` },
    offers: PLANS.map((p) => ({
      '@type': 'Offer',
      name: p.name,
      price: p.price,
      priceCurrency: 'USD',
      description: p.scripts,
    })),
  };
}

// Free tools: a free web app (price 0), separate from the paid product schema above.
export function webApplicationJsonLd({ name, description, path }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    description,
    url: absoluteUrl(path),
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    isAccessibleForFree: true,
    publisher: { '@id': `${SITE_URL}/#organization` },
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };
}

export function faqJsonLd(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function breadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
