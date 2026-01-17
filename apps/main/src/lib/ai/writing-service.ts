import { GoogleGenerativeAI } from '@google/generative-ai';
import { getNote, updateNote, createNote, type Note } from './notes-service';

// ============================================
// TYPES
// ============================================

export type EnhancementType = 'grammar' | 'clarity' | 'professional' | 'casual' | 'concise';
export type ExpandStyle = 'detailed' | 'examples' | 'explanatory' | 'creative';
export type CondenseTarget = 'brief' | 'half' | 'bullet-points';
export type FormatStyle = 'outline' | 'paragraphs' | 'bullet-list' | 'numbered-list' | 'sections';

export interface EnhanceResult {
  originalBody: string;
  enhancedBody: string;
  changes: string[];
  applied: boolean;
}

export interface ExpandResult {
  originalBody: string;
  expandedBody: string;
  addedSections: string[];
  applied: boolean;
}

export interface CondenseResult {
  originalBody: string;
  condensedBody: string;
  reduction: string;
  applied: boolean;
}

export interface FormatResult {
  originalBody: string;
  formattedBody: string;
  applied: boolean;
}

export interface TranslateResult {
  originalBody: string;
  translatedBody: string;
  newNoteId?: string;
  applied: boolean;
}

// ============================================
// GEMINI CLIENT
// ============================================

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  console.warn('NEXT_PUBLIC_GEMINI_API_KEY not set - writing service will not work');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

function getWritingModel() {
  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }

  return genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
    },
  });
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function fetchNote(userId: string, noteId: string): Promise<Note> {
  const note = await getNote(userId, noteId);
  if (!note) {
    throw new Error(`Note not found: ${noteId}`);
  }
  return note;
}

function calculateReduction(original: string, condensed: string): string {
  const originalWords = original.trim().split(/\s+/).length;
  const condensedWords = condensed.trim().split(/\s+/).length;
  const reduction = Math.round(((originalWords - condensedWords) / originalWords) * 100);
  return `${reduction}% reduction (${originalWords} -> ${condensedWords} words)`;
}

function extractChanges(original: string, enhanced: string): string[] {
  const changes: string[] = [];

  // Simple change detection based on common improvements
  if (original.length !== enhanced.length) {
    changes.push('Modified text length');
  }

  // Check for punctuation improvements
  const originalPunctuation = (original.match(/[.,!?;:]/g) || []).length;
  const enhancedPunctuation = (enhanced.match(/[.,!?;:]/g) || []).length;
  if (enhancedPunctuation > originalPunctuation) {
    changes.push('Improved punctuation');
  }

  // Check for capitalization improvements
  const originalCaps = (original.match(/[A-Z]/g) || []).length;
  const enhancedCaps = (enhanced.match(/[A-Z]/g) || []).length;
  if (enhancedCaps !== originalCaps) {
    changes.push('Adjusted capitalization');
  }

  // Check for word count changes
  const originalWords = original.trim().split(/\s+/).length;
  const enhancedWords = enhanced.trim().split(/\s+/).length;
  if (enhancedWords < originalWords) {
    changes.push('Made more concise');
  } else if (enhancedWords > originalWords) {
    changes.push('Added clarity');
  }

  if (changes.length === 0) {
    changes.push('General writing improvements');
  }

  return changes;
}

function extractAddedSections(original: string, expanded: string): string[] {
  const sections: string[] = [];

  // Detect new paragraphs
  const originalParagraphs = original.split(/\n\n+/).length;
  const expandedParagraphs = expanded.split(/\n\n+/).length;
  if (expandedParagraphs > originalParagraphs) {
    sections.push(`Added ${expandedParagraphs - originalParagraphs} new paragraph(s)`);
  }

  // Detect new bullet points
  const originalBullets = (original.match(/^[-*]\s/gm) || []).length;
  const expandedBullets = (expanded.match(/^[-*]\s/gm) || []).length;
  if (expandedBullets > originalBullets) {
    sections.push(`Added ${expandedBullets - originalBullets} bullet point(s)`);
  }

  // Detect new headers
  const originalHeaders = (original.match(/^#+\s/gm) || []).length;
  const expandedHeaders = (expanded.match(/^#+\s/gm) || []).length;
  if (expandedHeaders > originalHeaders) {
    sections.push(`Added ${expandedHeaders - originalHeaders} section header(s)`);
  }

  // Word count increase
  const originalWords = original.trim().split(/\s+/).length;
  const expandedWords = expanded.trim().split(/\s+/).length;
  const wordIncrease = expandedWords - originalWords;
  if (wordIncrease > 0) {
    sections.push(`Added approximately ${wordIncrease} words`);
  }

  if (sections.length === 0) {
    sections.push('Content expanded with additional details');
  }

  return sections;
}

// ============================================
// ENHANCEMENT PROMPTS
// ============================================

const enhancementPrompts: Record<EnhancementType, string> = {
  grammar: `You are a professional editor. Fix all grammar, spelling, and punctuation errors in the following text.
Maintain the original meaning and tone. Only fix errors, don't rewrite or rephrase unless necessary for correctness.
Return ONLY the corrected text, nothing else.`,

  clarity: `You are a writing clarity expert. Improve the clarity of the following text by:
- Simplifying complex sentences
- Removing ambiguity
- Improving word choices for better understanding
- Breaking down run-on sentences
Maintain the original meaning and intent. Return ONLY the improved text, nothing else.`,

  professional: `You are a business writing expert. Transform the following text into professional, formal language suitable for business communication:
- Use formal vocabulary
- Remove casual expressions and slang
- Ensure proper sentence structure
- Maintain a professional tone throughout
Return ONLY the professional version of the text, nothing else.`,

  casual: `You are a conversational writing expert. Transform the following text into casual, friendly language:
- Use conversational vocabulary
- Add natural contractions where appropriate
- Make the tone warm and approachable
- Keep it readable and engaging
Return ONLY the casual version of the text, nothing else.`,

  concise: `You are an expert at concise writing. Make the following text more concise by:
- Removing unnecessary words and redundancies
- Combining sentences where appropriate
- Using active voice
- Eliminating filler phrases
Maintain all key information while reducing word count. Return ONLY the concise version, nothing else.`,
};

// ============================================
// EXPAND PROMPTS
// ============================================

const expandPrompts: Record<ExpandStyle, string> = {
  detailed: `You are an expert writer. Expand the following text with more details:
- Add relevant supporting information
- Elaborate on key points
- Include context where helpful
- Maintain the original structure and voice
Return ONLY the expanded text, nothing else.`,

  examples: `You are an expert writer. Expand the following text by adding relevant examples:
- Include concrete examples to illustrate points
- Add use cases or scenarios where appropriate
- Use real-world analogies if helpful
- Keep examples relevant and concise
Return ONLY the expanded text with examples, nothing else.`,

  explanatory: `You are an expert explainer. Expand the following text with explanations:
- Break down complex concepts
- Add "why" and "how" explanations
- Include background information where helpful
- Make the content more accessible
Return ONLY the expanded explanatory text, nothing else.`,

  creative: `You are a creative writer. Expand the following text with creative elements:
- Add vivid descriptions and imagery
- Include engaging narrative elements
- Use metaphors or analogies where appropriate
- Make the content more engaging and memorable
Return ONLY the creatively expanded text, nothing else.`,
};

// ============================================
// CONDENSE PROMPTS
// ============================================

const condensePrompts: Record<CondenseTarget, string> = {
  brief: `You are an expert at summarization. Condense the following text to approximately 25% of its original length:
- Keep only the most essential information
- Remove all redundancy and filler
- Maintain the core message
- Ensure the condensed version stands alone
Return ONLY the condensed text, nothing else.`,

  half: `You are an expert at summarization. Condense the following text to approximately 50% of its original length:
- Preserve key points and main ideas
- Remove less critical details
- Maintain logical flow
- Keep important nuances
Return ONLY the condensed text, nothing else.`,

  'bullet-points': `You are an expert at creating summaries. Convert the following text into a concise bullet-point list:
- Extract the key points and main ideas
- Use clear, action-oriented language
- Group related points if appropriate
- Keep each bullet point concise (one line preferred)
Return ONLY the bullet-point list, nothing else. Use "-" for bullets.`,
};

// ============================================
// FORMAT PROMPTS
// ============================================

const formatPrompts: Record<FormatStyle, string> = {
  outline: `You are an expert at organizing information. Convert the following text into a structured outline:
- Use hierarchical numbering (1., 1.1, 1.2, 2., etc.)
- Group related information under appropriate headings
- Maintain logical flow and hierarchy
- Keep items concise
Return ONLY the outline, nothing else.`,

  paragraphs: `You are an expert at organizing text. Restructure the following text into well-organized paragraphs:
- Create clear topic sentences for each paragraph
- Ensure smooth transitions between paragraphs
- Group related ideas together
- Maintain logical flow
Return ONLY the restructured paragraphs, nothing else.`,

  'bullet-list': `You are an expert at organizing information. Convert the following text into a bullet-point list:
- Use "-" for bullet points
- Extract distinct points and ideas
- Keep each bullet concise
- Maintain logical ordering
Return ONLY the bullet list, nothing else.`,

  'numbered-list': `You are an expert at organizing information. Convert the following text into a numbered list:
- Use sequential numbers (1., 2., 3., etc.)
- Extract distinct points and ideas
- Keep each item concise
- Order logically (chronological, by importance, or by category)
Return ONLY the numbered list, nothing else.`,

  sections: `You are an expert at organizing documents. Structure the following text into clear sections:
- Add meaningful section headers (use ## for headers)
- Group related content under each section
- Ensure logical flow between sections
- Add brief introductions where helpful
Return ONLY the sectioned text, nothing else.`,
};

// ============================================
// MAIN FUNCTIONS
// ============================================

/**
 * Enhance note writing quality
 */
export async function enhanceNote(
  userId: string,
  noteId: string,
  enhancementType: EnhancementType,
  applyChanges: boolean = false
): Promise<EnhanceResult> {
  const note = await fetchNote(userId, noteId);
  const originalBody = note.body || '';

  if (!originalBody.trim()) {
    throw new Error('Note has no content to enhance');
  }

  const model = getWritingModel();
  const prompt = enhancementPrompts[enhancementType];

  const result = await model.generateContent(`${prompt}\n\nText to improve:\n${originalBody}`);
  const enhancedBody = result.response.text().trim();

  const changes = extractChanges(originalBody, enhancedBody);

  // Apply changes if requested
  let applied = false;
  if (applyChanges && enhancedBody !== originalBody) {
    await updateNote(userId, noteId, { body: enhancedBody });
    applied = true;
  }

  return {
    originalBody,
    enhancedBody,
    changes,
    applied,
  };
}

/**
 * Expand note with additional details
 */
export async function expandNote(
  userId: string,
  noteId: string,
  focus: string | undefined,
  style: ExpandStyle = 'detailed',
  applyChanges: boolean = false
): Promise<ExpandResult> {
  const note = await fetchNote(userId, noteId);
  const originalBody = note.body || '';

  if (!originalBody.trim()) {
    throw new Error('Note has no content to expand');
  }

  const model = getWritingModel();
  let prompt = expandPrompts[style];

  if (focus) {
    prompt += `\n\nFocus specifically on expanding content related to: ${focus}`;
  }

  const result = await model.generateContent(`${prompt}\n\nText to expand:\n${originalBody}`);
  const expandedBody = result.response.text().trim();

  const addedSections = extractAddedSections(originalBody, expandedBody);

  // Apply changes if requested
  let applied = false;
  if (applyChanges) {
    await updateNote(userId, noteId, { body: expandedBody });
    applied = true;
  }

  return {
    originalBody,
    expandedBody,
    addedSections,
    applied,
  };
}

/**
 * Condense note content
 */
export async function condenseNote(
  userId: string,
  noteId: string,
  targetLength: CondenseTarget = 'half',
  applyChanges: boolean = false
): Promise<CondenseResult> {
  const note = await fetchNote(userId, noteId);
  const originalBody = note.body || '';

  if (!originalBody.trim()) {
    throw new Error('Note has no content to condense');
  }

  const model = getWritingModel();
  const prompt = condensePrompts[targetLength];

  const result = await model.generateContent(`${prompt}\n\nText to condense:\n${originalBody}`);
  const condensedBody = result.response.text().trim();

  const reduction = calculateReduction(originalBody, condensedBody);

  // Apply changes if requested
  let applied = false;
  if (applyChanges) {
    await updateNote(userId, noteId, { body: condensedBody });
    applied = true;
  }

  return {
    originalBody,
    condensedBody,
    reduction,
    applied,
  };
}

/**
 * Format note with improved structure
 */
export async function formatNote(
  userId: string,
  noteId: string,
  formatStyle: FormatStyle,
  applyChanges: boolean = false
): Promise<FormatResult> {
  const note = await fetchNote(userId, noteId);
  const originalBody = note.body || '';

  if (!originalBody.trim()) {
    throw new Error('Note has no content to format');
  }

  const model = getWritingModel();
  const prompt = formatPrompts[formatStyle];

  const result = await model.generateContent(`${prompt}\n\nText to format:\n${originalBody}`);
  const formattedBody = result.response.text().trim();

  // Apply changes if requested
  let applied = false;
  if (applyChanges) {
    await updateNote(userId, noteId, { body: formattedBody });
    applied = true;
  }

  return {
    originalBody,
    formattedBody,
    applied,
  };
}

/**
 * Translate note content to another language
 */
export async function translateNote(
  userId: string,
  noteId: string,
  targetLanguage: string,
  replaceOriginal: boolean = false
): Promise<TranslateResult> {
  const note = await fetchNote(userId, noteId);
  const originalBody = note.body || '';

  if (!originalBody.trim()) {
    throw new Error('Note has no content to translate');
  }

  const model = getWritingModel();

  const prompt = `You are a professional translator. Translate the following text to ${targetLanguage}.
- Maintain the original meaning, tone, and formatting
- Preserve any technical terms appropriately
- Keep the same paragraph structure
- Ensure natural-sounding translation in the target language
Return ONLY the translated text, nothing else.`;

  const result = await model.generateContent(`${prompt}\n\nText to translate:\n${originalBody}`);
  const translatedBody = result.response.text().trim();

  let applied = false;
  let newNoteId: string | undefined;

  if (replaceOriginal) {
    // Replace the original note's content
    await updateNote(userId, noteId, { body: translatedBody });
    applied = true;
  } else {
    // Create a new note with the translated content
    const newTitle = `${note.title} (${targetLanguage})`;
    newNoteId = await createNote(userId, {
      title: newTitle,
      body: translatedBody,
      color: note.color,
      spaceId: note.spaceId,
      priority: note.priority,
      labelIds: note.labelIds,
    });
    applied = true;
  }

  return {
    originalBody,
    translatedBody,
    newNoteId,
    applied,
  };
}

// ============================================
// UTILITY EXPORTS
// ============================================

export const ENHANCEMENT_TYPES: EnhancementType[] = [
  'grammar',
  'clarity',
  'professional',
  'casual',
  'concise',
];

export const EXPAND_STYLES: ExpandStyle[] = ['detailed', 'examples', 'explanatory', 'creative'];

export const CONDENSE_TARGETS: CondenseTarget[] = ['brief', 'half', 'bullet-points'];

export const FORMAT_STYLES: FormatStyle[] = [
  'outline',
  'paragraphs',
  'bullet-list',
  'numbered-list',
  'sections',
];

// Common language codes for translation
export const COMMON_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'nl', name: 'Dutch' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'zh-TW', name: 'Chinese (Traditional)' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'th', name: 'Thai' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'pl', name: 'Polish' },
  { code: 'tr', name: 'Turkish' },
  { code: 'sv', name: 'Swedish' },
  { code: 'no', name: 'Norwegian' },
  { code: 'da', name: 'Danish' },
  { code: 'fi', name: 'Finnish' },
];
