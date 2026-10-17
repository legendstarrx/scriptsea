import Head from 'next/head';
import { SITE_NAME, DEFAULT_OG_IMAGE, absoluteUrl } from '../lib/seo';

/**
 * Per-page SEO tags. Every page should render exactly one of these.
 * `key`s match the defaults in _app.tsx so next/head replaces them.
 */
export default function SEO({ title, description, path = '/', noindex = false, jsonLd = [], ogImage = DEFAULT_OG_IMAGE }) {
  const url = absoluteUrl(path);
  const schemas = Array.isArray(jsonLd) ? jsonLd : [jsonLd];

  return (
    <Head>
      <title key="title">{title}</title>
      <meta key="description" name="description" content={description} />
      <meta key="robots" name="robots" content={noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'} />
      {!noindex && <link key="canonical" rel="canonical" href={url} />}

      <meta key="og:type" property="og:type" content="website" />
      <meta key="og:site_name" property="og:site_name" content={SITE_NAME} />
      <meta key="og:title" property="og:title" content={title} />
      <meta key="og:description" property="og:description" content={description} />
      <meta key="og:url" property="og:url" content={url} />
      <meta key="og:image" property="og:image" content={ogImage} />
      <meta key="og:image:width" property="og:image:width" content="1200" />
      <meta key="og:image:height" property="og:image:height" content="630" />
      <meta key="og:image:alt" property="og:image:alt" content={`${SITE_NAME} — AI script generator and AI video prompt generator`} />

      <meta key="twitter:card" name="twitter:card" content="summary_large_image" />
      <meta key="twitter:title" name="twitter:title" content={title} />
      <meta key="twitter:description" name="twitter:description" content={description} />
      <meta key="twitter:image" name="twitter:image" content={ogImage} />

      {schemas.filter(Boolean).map((schema, i) => (
        <script
          key={`jsonld-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </Head>
  );
}
