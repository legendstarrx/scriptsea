import BlogList from '../../../components/BlogList';
import { getAllPosts } from '../../../lib/blog/posts';
import { postsForPage, totalPages } from '../../../lib/blog/paginate';

// /blog/page/2, /blog/page/3 ... Page 1 lives at /blog.
export default function BlogPage(props) {
  return <BlogList {...props} />;
}

export async function getStaticPaths() {
  const pages = totalPages(getAllPosts().length);
  const paths = [];
  for (let n = 2; n <= pages; n += 1) paths.push({ params: { page: String(n) } });
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const all = getAllPosts();
  const page = Number(params.page);
  const pages = totalPages(all.length);
  if (!Number.isInteger(page) || page < 2 || page > pages) return { notFound: true };
  return { props: { posts: postsForPage(all, page), page, pages, total: all.length } };
}
