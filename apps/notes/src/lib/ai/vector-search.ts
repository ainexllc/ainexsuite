/**
 * Vector Search Helper for Notes AI
 *
 * This module provides semantic search capabilities using Firestore Vector Search.
 * Requires the Firebase Vector Search Extension to be installed.
 *
 * Installation:
 * 1. Go to Firebase Console > Extensions
 * 2. Install "Vector Search with Firestore" by Google Cloud
 * 3. Configure:
 *    - Collection: users/{userId}/notes
 *    - Input field: searchContent (title + body combined)
 *    - Output field: embedding
 *    - Provider: Gemini (free tier)
 *
 * @see https://extensions.dev/extensions/googlecloud/firestore-vector-search
 */

import { getFunctions, httpsCallable } from 'firebase/functions';
import type { Note } from '@/lib/types/note';

// Extension instance ID (change if you used a different name during installation)
const EXTENSION_ID = 'firestore-vector-search';

interface VectorSearchResult {
  id: string;
  distance: number;
  data: Record<string, unknown>;
}

interface VectorSearchResponse {
  results: VectorSearchResult[];
}

interface SearchOptions {
  query: string;
  limit?: number;
  userId?: string;
}

/**
 * Check if the Vector Search Extension is available
 */
export async function isVectorSearchAvailable(): Promise<boolean> {
  try {
    const functions = getFunctions();
    const queryFn = httpsCallable(functions, `ext-${EXTENSION_ID}-queryCallable`);
    // Try a simple query to verify the extension is installed
    await queryFn({ query: 'test', limit: 1 });
    return true;
  } catch (error) {
    // Extension not installed or not configured
    return false;
  }
}

/**
 * Search notes using semantic similarity
 *
 * @param options Search options including query and limit
 * @returns Array of matching notes with relevance scores
 */
export async function searchNotesSemantic(
  options: SearchOptions
): Promise<{ id: string; score: number }[]> {
  const { query, limit = 5, userId } = options;

  try {
    const functions = getFunctions();
    const queryFn = httpsCallable<
      { query: string; limit: number; prefilters?: Array<{ field: string; operator: string; value: string }> },
      VectorSearchResponse
    >(functions, `ext-${EXTENSION_ID}-queryCallable`);

    // Build prefilters to scope to user's notes
    const prefilters = userId
      ? [{ field: 'userId', operator: '==', value: userId }]
      : [];

    const response = await queryFn({
      query,
      limit,
      prefilters,
    });

    // Transform results to our format
    return response.data.results.map((result) => ({
      id: result.id,
      // Convert distance to score (lower distance = higher score)
      score: 1 - result.distance,
    }));
  } catch (error) {
    console.error('[Vector Search] Error:', error);
    throw new Error('Vector search failed. Is the extension installed?');
  }
}

/**
 * Prepare note content for embedding
 * Combines title and body into a single searchable string
 */
export function prepareSearchContent(note: Partial<Note>): string {
  const parts: string[] = [];

  if (note.title) {
    parts.push(note.title);
  }

  if (note.type === 'text' && note.body) {
    // Strip HTML tags for plain text
    const plainText = note.body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    parts.push(plainText);
  }

  if (note.type === 'checklist' && note.checklist?.length) {
    const items = note.checklist.map((item) => item.text).join('. ');
    parts.push(items);
  }

  return parts.join(' ').slice(0, 2000); // Limit to 2000 chars for embedding
}

/**
 * Check if a note document has an embedding
 */
export function hasEmbedding(note: Note & { embedding?: number[] }): boolean {
  return Array.isArray(note.embedding) && note.embedding.length > 0;
}

/**
 * Fallback keyword search when vector search is unavailable
 * Uses simple term matching with scoring
 */
export function keywordSearch(
  notes: Note[],
  query: string,
  limit: number = 5
): { id: string; score: number }[] {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 2);

  const scored = notes
    .filter((n) => !n.archived && !n.deletedAt)
    .map((n) => {
      let score = 0;
      const title = (n.title || '').toLowerCase();
      const body = n.body
        ? n.body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase()
        : '';
      const checklistText =
        n.type === 'checklist'
          ? n.checklist.map((i) => i.text).join(' ').toLowerCase()
          : '';

      for (const word of queryWords) {
        if (title.includes(word)) score += 3;
        if (body.includes(word)) score += 1;
        if (checklistText.includes(word)) score += 1;
      }

      if (n.pinned) score += 0.5;

      return { id: n.id, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
}
