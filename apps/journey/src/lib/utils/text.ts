/**
 * Text utility functions for content manipulation and parsing
 */

export function plainText(content: string): string {
  return content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return `${text.slice(0, length).trimEnd()}…`;
}

export function countWords(content: string): number {
  const text = plainText(content).trim();
  if (!text.length) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}
