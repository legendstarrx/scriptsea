// Blog posts live as Markdown files in content/blog. Add a post by adding a file.
// Server-only (getStaticProps / sitemap): reads the filesystem.
import fs from 'fs';
import path from 'path';
import { parseFrontmatter, markdownToHtml, extractFaq, countWords } from './markdown';

const POSTS_DIR = path.join(process.cwd(), 'content', 'blog');

function readPostFiles() {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md')).map((file) => {
    const { data, body } = parseFrontmatter(fs.readFileSync(path.join(POSTS_DIR, file), 'utf8'));
    return { file, data, body, slug: data.slug || file.replace(/\.md$/, '') };
  });
}

const summary = ({ slug, data }) => ({
  slug,
  title: data.title || slug,
  description: data.description || '',
  date: data.date || '',
  readTime: data.readTime || '',
  heroImage: data.heroImage || null,
  heroAlt: data.heroAlt || '',
});

/** All posts, newest first, without bodies. */
export function getAllPosts() {
  return readPostFiles().map(summary).sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** One post with its body as HTML, FAQ, related links and OG image. */
export function getPost(slug) {
  const post = readPostFiles().find((p) => p.slug === slug);
  if (!post) return null;
  const { body, faqs } = extractFaq(post.body);
  const hero = post.data.heroImage || null;
  // Social previews use a .jpg copy of the hero when one exists (wider support than WebP).
  const jpg = hero ? hero.replace(/\.webp$/i, '.jpg') : null;
  const ogImage = jpg && fs.existsSync(path.join(process.cwd(), 'public', jpg)) ? jpg : hero;
  return {
    ...summary(post),
    html: markdownToHtml(body),
    faqs,
    relatedLinks: Array.isArray(post.data.relatedLinks) ? post.data.relatedLinks.filter((l) => l && l.href && l.title) : [],
    ogImage,
    wordCount: countWords(body),
  };
}
