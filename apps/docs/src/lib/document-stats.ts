/**
 * Document statistics utility
 * Calculates word count, character count, and reading time
 */

export interface DocStats {
  words: number;
  chars: number;
  charsNoSpaces: number;
  readingTime: number; // in minutes
  sentences: number;
}

/**
 * Calculate document statistics from text content
 * @param text - The text content to analyze (can be plain text or HTML stripped)
 * @returns DocStats object with various statistics
 */
export function getDocStats(text: string): DocStats {
  // Handle empty or whitespace-only text
  if (!text || !text.trim()) {
    return {
      words: 0,
      chars: 0,
      charsNoSpaces: 0,
      readingTime: 0,
      sentences: 0,
    };
  }

  // Strip HTML tags if present
  const plainText = text.replace(/<[^>]*>/g, '');

  // Character counts
  const chars = plainText.length;
  const charsNoSpaces = plainText.replace(/\s/g, '').length;

  // Word count - split on whitespace and filter empty strings
  const wordArray = plainText.trim().split(/\s+/).filter(word => word.length > 0);
  const words = wordArray.length;

  // Sentence count - count sentence-ending punctuation
  const sentenceMatches = plainText.match(/[.!?]+/g);
  const sentences = sentenceMatches ? sentenceMatches.length : (words > 0 ? 1 : 0);

  // Reading time - average reading speed is 200-250 words per minute
  // Using 200 wpm for more conservative estimate
  const readingTime = Math.max(1, Math.ceil(words / 200));

  return {
    words,
    chars,
    charsNoSpaces,
    readingTime,
    sentences,
  };
}

/**
 * Format reading time for display
 * @param minutes - Reading time in minutes
 * @returns Formatted string like "< 1 min", "2 min", "5 min read"
 */
export function formatReadingTime(minutes: number): string {
  if (minutes === 0) return '';
  if (minutes === 1) return '< 1 min';
  return `${minutes} min`;
}

/**
 * Format stats for compact display
 * @param stats - DocStats object
 * @returns Formatted string like "247 words · 2 min read"
 */
export function formatDocStats(stats: DocStats): string {
  if (stats.words === 0) return '';

  const wordText = stats.words === 1 ? '1 word' : `${stats.words.toLocaleString()} words`;
  const timeText = formatReadingTime(stats.readingTime);

  if (!timeText) return wordText;
  return `${wordText} · ${timeText} read`;
}
