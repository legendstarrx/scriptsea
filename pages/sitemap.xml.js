import { SITE_URL } from '../lib/seo';
import { TOOL_SLUGS } from '../lib/toolPages';

// Served at /sitemap.xml. Built from the same list as the landing pages,
// so a new tool page shows up here automatically.
const PAGES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  ...TOOL_SLUGS.map((slug) => ({ path: `/${slug}`, priority: '0.9', changefreq: 'weekly' })),
  { path: '/pricing', priority: '0.8', changefreq: 'monthly' },
  { path: '/about', priority: '0.5', changefreq: 'monthly' },
  { path: '/contact', priority: '0.4', changefreq: 'yearly' },
  { path: '/privacy', priority: '0.2', changefreq: 'yearly' },
  { path: '/refund', priority: '0.2', changefreq: 'yearly' },
];

function buildSitemap() {
  const lastmod = new Date().toISOString().split('T')[0];
  const urls = PAGES.map(
    (p) => `  <url>
    <loc>${SITE_URL}${p.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  ).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

export async function getServerSideProps({ res }) {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=86400');
  res.write(buildSitemap());
  res.end();
  return { props: {} };
}

export default function Sitemap() {
  return null;
}
