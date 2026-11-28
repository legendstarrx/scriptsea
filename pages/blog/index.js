import BlogList from '../../components/BlogList';
import { getAllPosts } from '../../lib/blog/posts';
import { postsForPage, totalPages } from '../../lib/blog/paginate';

export default function BlogIndex(props) {
  return <BlogList {...props} />;
}

export async function getStaticProps() {
  const all = getAllPosts();
  return { props: { posts: postsForPage(all, 1), page: 1, pages: totalPages(all.length), total: all.length } };
}
