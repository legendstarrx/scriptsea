/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import { SITE_URL, breadcrumbJsonLd } from '../../lib/seo';
import { getAllPosts } from '../../lib/blog/posts';
import { formatDate } from '../../lib/blog/format';

const TITLE = 'The ScriptSea Blog: AI Video Prompts and Scripts';
const DESCRIPTION = 'Straight answers on AI video prompts, scripts and growing on YouTube, from people who make AI videos every day.';

export default function BlogIndex({ posts }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#fafafa]">
      <SEO
        title={TITLE}
        description={DESCRIPTION}
        path="/blog"
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: 'The ScriptSea blog',
            description: DESCRIPTION,
            url: `${SITE_URL}/blog`,
            publisher: { '@id': `${SITE_URL}/#organization` },
            blogPost: posts.map((p) => ({ '@type': 'BlogPosting', headline: p.title, url: `${SITE_URL}/blog/${p.slug}`, datePublished: p.date })),
          },
          breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }]),
        ]}
      />
      <Navigation />
      <main className="flex-1 pt-16">
        <section className="bg-gradient-to-b from-[#fff5f7] to-[#fafafa] pb-8 pt-10 sm:pt-14">
          <div className="mx-auto max-w-5xl px-4">
            <h1 className="text-[2rem] font-extrabold leading-tight tracking-tight text-zinc-950 sm:text-5xl">The ScriptSea blog</h1>
            <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-zinc-600">
              Straight answers on AI video prompts, scripts and growing on YouTube.
            </p>
          </div>
        </section>

        <section className="pb-16">
          <div className="mx-auto grid max-w-5xl gap-6 px-4 sm:grid-cols-2">
            {posts.map((p, i) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="group overflow-hidden rounded-3xl bg-white ring-1 ring-zinc-200 transition hover:ring-brand-300">
                {p.heroImage && (
                  <img
                    src={p.heroImage}
                    alt={p.heroAlt}
                    width={1200}
                    height={630}
                    loading={i < 2 ? 'eager' : 'lazy'}
                    decoding="async"
                    className="aspect-[1200/630] w-full object-cover"
                  />
                )}
                <div className="p-5 sm:p-6">
                  <p className="text-[13px] text-zinc-500">{formatDate(p.date)}{p.readTime ? ` · ${p.readTime}` : ''}</p>
                  <h2 className="mt-2 text-xl font-extrabold leading-snug text-zinc-950 group-hover:text-brand-600">{p.title}</h2>
                  <p className="mt-2 leading-relaxed text-zinc-600">{p.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export async function getStaticProps() {
  return { props: { posts: getAllPosts() } };
}
