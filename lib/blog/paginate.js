// Blog list pagination. Page 1 is /blog, page 2+ is /blog/page/2 and so on.
export const POSTS_PER_PAGE = 10;

export function totalPages(count) {
  return Math.max(1, Math.ceil(count / POSTS_PER_PAGE));
}

export function pagePath(page) {
  return page <= 1 ? '/blog' : `/blog/page/${page}`;
}

export function postsForPage(posts, page) {
  const start = (page - 1) * POSTS_PER_PAGE;
  return posts.slice(start, start + POSTS_PER_PAGE);
}
