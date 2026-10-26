/** Every ScriptSea button on the free tools goes to signup, tagged by page and placement. */
export function signupHref(slug, placement) {
  const q = new URLSearchParams({
    utm_source: 'free-tool',
    utm_medium: 'seo',
    utm_campaign: slug,
    utm_content: placement,
  });
  return `/register?${q.toString()}`;
}
