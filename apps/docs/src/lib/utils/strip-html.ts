/**
 * Strips HTML tags from a string and returns plain text.
 * Useful for displaying rich text content in card previews.
 * Uses regex-based approach that's safe for SSR and doesn't execute any HTML.
 */
export function stripHtml(html: string): string {
  if (!html) return '';

  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
    .replace(/&amp;/g, '&')  // Replace ampersands
    .replace(/&lt;/g, '<')   // Replace less than
    .replace(/&gt;/g, '>')   // Replace greater than
    .replace(/&quot;/g, '"') // Replace quotes
    .replace(/&#39;/g, "'")  // Replace apostrophes
    .replace(/\s+/g, ' ')    // Normalize whitespace
    .trim();
}
