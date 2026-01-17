import { GoogleGenerativeAI } from '@google/generative-ai';
import { getNote, listNotes, Note } from './notes-service';

// ============================================
// TYPES
// ============================================

export type SentimentType = 'positive' | 'negative' | 'neutral' | 'mixed';

export interface EmotionScores {
  joy: number;
  sadness: number;
  anger: number;
  fear: number;
  surprise: number;
  love: number;
}

export interface SentimentAnalysis {
  sentiment: SentimentType;
  sentimentScore: number; // -1 to 1
  emotions: EmotionScores;
  keywords: string[];
  themes: string[];
}

export interface ThemeInfo {
  name: string;
  noteCount: number;
  keywords: string[];
}

export interface ThemeExtraction {
  themes: ThemeInfo[];
  trendingTopics: string[];
  emergingThemes: string[];
}

export type SummaryStyle = 'brief' | 'detailed' | 'bullet-points';

export interface NoteSummary {
  summary: string;
  keyPoints: string[];
  wordCount: number;
}

export interface SimilarNote {
  id: string;
  title: string;
  similarity: number;
  sharedThemes: string[];
}

export interface SimilarNotesResult {
  similarNotes: SimilarNote[];
}

export interface KeywordInfo {
  word: string;
  frequency: number;
  importance: number;
}

export interface KeywordExtraction {
  keywords: KeywordInfo[];
  suggestedLabels: string[];
}

export interface DuplicateGroup {
  notes: Array<{ id: string; title: string }>;
  similarity: number;
  recommendation: string;
}

export interface DuplicateDetection {
  duplicateGroups: DuplicateGroup[];
}

// ============================================
// GEMINI SETUP
// ============================================

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  console.warn('NEXT_PUBLIC_GEMINI_API_KEY not set for content analysis');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

function getModel() {
  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }
  return genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 4096,
    },
  });
}

// ============================================
// HELPERS
// ============================================

function getNoteContent(note: Note): string {
  let content = note.title || '';
  if (note.body) {
    content += '\n\n' + note.body;
  }
  if (note.checklist && note.checklist.length > 0) {
    const checklistText = note.checklist
      .map((item) => `- [${item.completed ? 'x' : ' '}] ${item.text}`)
      .join('\n');
    content += '\n\n' + checklistText;
  }
  return content;
}

function parseJsonResponse<T>(text: string): T {
  // Extract JSON from potential markdown code blocks
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = jsonMatch ? jsonMatch[1].trim() : text.trim();
  return JSON.parse(jsonStr);
}

// ============================================
// CONTENT ANALYSIS FUNCTIONS
// ============================================

/**
 * Analyze sentiment and emotional tone of a note or recent notes
 */
export async function analyzeNoteSentiment(
  userId: string,
  noteIdOrAnalyzeRecent: string | 'analyzeRecent',
  limit: number = 10
): Promise<SentimentAnalysis> {
  const model = getModel();

  let content: string;

  if (noteIdOrAnalyzeRecent === 'analyzeRecent') {
    const notes = await listNotes(userId, limit);
    if (notes.length === 0) {
      return {
        sentiment: 'neutral',
        sentimentScore: 0,
        emotions: { joy: 0, sadness: 0, anger: 0, fear: 0, surprise: 0, love: 0 },
        keywords: [],
        themes: [],
      };
    }
    content = notes.map((note) => getNoteContent(note)).join('\n\n---\n\n');
  } else {
    const note = await getNote(userId, noteIdOrAnalyzeRecent);
    if (!note) {
      throw new Error('Note not found');
    }
    content = getNoteContent(note);
  }

  const prompt = `Analyze the emotional tone and sentiment of the following content. Return a JSON object with this exact structure:

{
  "sentiment": "positive" | "negative" | "neutral" | "mixed",
  "sentimentScore": <number from -1 (very negative) to 1 (very positive)>,
  "emotions": {
    "joy": <0-1>,
    "sadness": <0-1>,
    "anger": <0-1>,
    "fear": <0-1>,
    "surprise": <0-1>,
    "love": <0-1>
  },
  "keywords": [<array of 5-10 important words/phrases>],
  "themes": [<array of 3-5 main themes or topics>]
}

Content to analyze:
"""
${content}
"""

Return only valid JSON, no additional text.`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  try {
    return parseJsonResponse<SentimentAnalysis>(text);
  } catch {
    // Return default values if parsing fails
    return {
      sentiment: 'neutral',
      sentimentScore: 0,
      emotions: { joy: 0, sadness: 0, anger: 0, fear: 0, surprise: 0, love: 0 },
      keywords: [],
      themes: [],
    };
  }
}

/**
 * Extract common themes from notes in a space
 */
export async function extractThemes(
  userId: string,
  spaceId?: string,
  limit: number = 50
): Promise<ThemeExtraction> {
  const model = getModel();

  const notes = await listNotes(userId, limit, spaceId);

  if (notes.length === 0) {
    return {
      themes: [],
      trendingTopics: [],
      emergingThemes: [],
    };
  }

  // Prepare note summaries for analysis
  const noteSummaries = notes.map((note, index) => ({
    index: index + 1,
    title: note.title,
    preview: note.body?.substring(0, 200) || '',
    type: note.type,
    createdAt: note.createdAt.toISOString(),
  }));

  const prompt = `Analyze the following ${notes.length} notes and identify common themes, trending topics, and emerging themes.

Notes:
${JSON.stringify(noteSummaries, null, 2)}

Return a JSON object with this exact structure:
{
  "themes": [
    {
      "name": "<theme name>",
      "noteCount": <number of notes related to this theme>,
      "keywords": [<array of related keywords>]
    }
  ],
  "trendingTopics": [<array of currently popular topics based on recent notes>],
  "emergingThemes": [<array of new/developing themes that appear infrequently but are significant>]
}

Guidelines:
- Identify 5-10 main themes
- Trending topics should be based on recent activity
- Emerging themes are topics that appear in newer notes but haven't become major themes yet
- Return only valid JSON, no additional text.`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  try {
    return parseJsonResponse<ThemeExtraction>(text);
  } catch {
    return {
      themes: [],
      trendingTopics: [],
      emergingThemes: [],
    };
  }
}

/**
 * Generate AI-powered summary of a note or recent notes
 */
export async function generateSummary(
  userId: string,
  noteIdOrSummarizeRecent: string | 'summarizeRecent',
  limit: number = 10,
  style: SummaryStyle = 'brief'
): Promise<NoteSummary> {
  const model = getModel();

  let content: string;

  if (noteIdOrSummarizeRecent === 'summarizeRecent') {
    const notes = await listNotes(userId, limit);
    if (notes.length === 0) {
      return {
        summary: 'No notes found to summarize.',
        keyPoints: [],
        wordCount: 0,
      };
    }
    content = notes.map((note) => getNoteContent(note)).join('\n\n---\n\n');
  } else {
    const note = await getNote(userId, noteIdOrSummarizeRecent);
    if (!note) {
      throw new Error('Note not found');
    }
    content = getNoteContent(note);
  }

  const styleInstructions = {
    brief: 'Provide a concise 2-3 sentence summary capturing the main points.',
    detailed:
      'Provide a comprehensive summary covering all important aspects, including context and details. 1-2 paragraphs.',
    'bullet-points':
      'Provide the summary as a structured list of bullet points, each capturing a distinct idea or fact.',
  };

  const prompt = `Summarize the following content.

Style: ${style}
Instructions: ${styleInstructions[style]}

Content:
"""
${content}
"""

Return a JSON object with this exact structure:
{
  "summary": "<the summary text>",
  "keyPoints": [<array of 3-7 key takeaways or important points>],
  "wordCount": <number of words in the original content>
}

Return only valid JSON, no additional text.`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  try {
    return parseJsonResponse<NoteSummary>(text);
  } catch {
    return {
      summary: 'Unable to generate summary.',
      keyPoints: [],
      wordCount: content.split(/\s+/).length,
    };
  }
}

/**
 * Find notes similar to a given note based on content
 */
export async function findSimilarNotes(
  userId: string,
  noteId: string,
  threshold: number = 0.5
): Promise<SimilarNotesResult> {
  const model = getModel();

  const targetNote = await getNote(userId, noteId);
  if (!targetNote) {
    throw new Error('Note not found');
  }

  const allNotes = await listNotes(userId, 100);
  const otherNotes = allNotes.filter((n) => n.id !== noteId);

  if (otherNotes.length === 0) {
    return { similarNotes: [] };
  }

  const targetContent = getNoteContent(targetNote);
  const noteData = otherNotes.map((note) => ({
    id: note.id,
    title: note.title,
    content: getNoteContent(note).substring(0, 500),
  }));

  const prompt = `Compare the target note with the other notes and identify similar notes based on content, themes, and topics.

Target Note:
Title: "${targetNote.title}"
Content: "${targetContent.substring(0, 500)}"

Other Notes:
${JSON.stringify(noteData, null, 2)}

Return a JSON object with this exact structure:
{
  "similarNotes": [
    {
      "id": "<note id>",
      "title": "<note title>",
      "similarity": <0-1 similarity score>,
      "sharedThemes": [<array of shared themes/topics>]
    }
  ]
}

Guidelines:
- Only include notes with similarity score >= ${threshold}
- Sort by similarity score descending
- Include up to 10 most similar notes
- sharedThemes should list specific topics/themes both notes share
- Return only valid JSON, no additional text.`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  try {
    const parsed = parseJsonResponse<SimilarNotesResult>(text);
    // Filter by threshold in case AI didn't
    parsed.similarNotes = parsed.similarNotes.filter((n) => n.similarity >= threshold);
    return parsed;
  } catch {
    return { similarNotes: [] };
  }
}

/**
 * Extract important keywords from a note or recent notes
 */
export async function extractKeywords(
  userId: string,
  noteIdOrExtractFromRecent: string | 'extractFromRecent',
  limit: number = 10
): Promise<KeywordExtraction> {
  const model = getModel();

  let content: string;

  if (noteIdOrExtractFromRecent === 'extractFromRecent') {
    const notes = await listNotes(userId, limit);
    if (notes.length === 0) {
      return {
        keywords: [],
        suggestedLabels: [],
      };
    }
    content = notes.map((note) => getNoteContent(note)).join('\n\n---\n\n');
  } else {
    const note = await getNote(userId, noteIdOrExtractFromRecent);
    if (!note) {
      throw new Error('Note not found');
    }
    content = getNoteContent(note);
  }

  const prompt = `Extract important keywords and suggest labels for the following content.

Content:
"""
${content}
"""

Return a JSON object with this exact structure:
{
  "keywords": [
    {
      "word": "<keyword or phrase>",
      "frequency": <estimated occurrences or relevance frequency 1-10>,
      "importance": <0-1 importance score based on semantic significance>
    }
  ],
  "suggestedLabels": [<array of 3-7 suggested labels/tags for organizing this content>]
}

Guidelines:
- Extract 10-20 most important keywords/phrases
- Keywords should include both single words and meaningful phrases
- Importance score should reflect semantic significance, not just frequency
- Suggested labels should be concise, actionable tags suitable for note organization
- Return only valid JSON, no additional text.`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  try {
    return parseJsonResponse<KeywordExtraction>(text);
  } catch {
    return {
      keywords: [],
      suggestedLabels: [],
    };
  }
}

/**
 * Detect duplicate or highly similar notes
 */
export async function detectDuplicates(
  userId: string,
  spaceId?: string,
  threshold: number = 0.8
): Promise<DuplicateDetection> {
  const model = getModel();

  const notes = await listNotes(userId, 100, spaceId);

  if (notes.length < 2) {
    return { duplicateGroups: [] };
  }

  const noteData = notes.map((note) => ({
    id: note.id,
    title: note.title,
    preview: getNoteContent(note).substring(0, 300),
    type: note.type,
  }));

  const prompt = `Analyze the following notes and identify groups of duplicate or highly similar notes.

Notes:
${JSON.stringify(noteData, null, 2)}

Return a JSON object with this exact structure:
{
  "duplicateGroups": [
    {
      "notes": [
        { "id": "<note id>", "title": "<note title>" }
      ],
      "similarity": <0-1 similarity score for the group>,
      "recommendation": "<suggestion for handling these duplicates>"
    }
  ]
}

Guidelines:
- Only include groups where similarity >= ${threshold}
- Each group should contain 2 or more notes
- Recommendation should suggest keeping one note, merging, or other action
- Consider both title and content similarity
- Sort groups by similarity descending
- Return only valid JSON, no additional text.`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  try {
    const parsed = parseJsonResponse<DuplicateDetection>(text);
    // Filter by threshold in case AI didn't
    parsed.duplicateGroups = parsed.duplicateGroups.filter((g) => g.similarity >= threshold);
    return parsed;
  } catch {
    return { duplicateGroups: [] };
  }
}
