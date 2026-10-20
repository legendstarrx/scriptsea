/**
 * Retired. This endpoint used to accept any prompt from the browser, which let
 * anyone use our AI key for anything and exposed the prompt recipe.
 * Scripts now go through /api/ai/script, which builds the prompt server-side.
 */
export default function handler(_req, res) {
  return res.status(410).json({ error: 'ScriptSea was just updated. Please refresh the page and try again.' });
}
