import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '@ainexsuite/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import type { Note, NoteColor, NotePriority, ChecklistItem } from './notes-service';
import { listLabels, listNotes, getNote } from './notes-service';

// ============================================
// TYPES
// ============================================

export interface LabelSuggestion {
  id: string;
  name: string;
  confidence: number;
}

export interface NewLabelSuggestion {
  name: string;
  reason: string;
}

export interface LabelSuggestionResult {
  existingLabels: LabelSuggestion[];
  suggestedNew: NewLabelSuggestion[];
  overallConfidence: number;
}

export interface PriorityPrediction {
  suggestedPriority: 'high' | 'medium' | 'low';
  reasoning: string;
  factors: string[];
}

export interface RelatedNote {
  id: string;
  title: string;
  relationshipType: 'similar_topic' | 'same_project' | 'continuation' | 'reference' | 'complement';
  strength: number;
}

export interface RelatedNotesResult {
  relatedNotes: RelatedNote[];
}

export interface ActionSuggestion {
  action: string;
  priority: 'high' | 'medium' | 'low';
  reasoning: string;
}

export interface NextActionsResult {
  suggestions: ActionSuggestion[];
}

export interface ArchiveSuggestion {
  noteId: string;
  noteTitle: string;
  reason: string;
  confidence: number;
}

export interface MergeCandidate {
  noteIds: string[];
  noteTitles: string[];
  reason: string;
  suggestedTitle: string;
}

export interface LabelOrganizationSuggestion {
  noteId: string;
  noteTitle: string;
  suggestedLabels: string[];
  reason: string;
}

export interface CleanupAction {
  type: 'archive' | 'delete' | 'merge' | 'label' | 'prioritize';
  description: string;
  affectedNotes: string[];
  reason: string;
}

export interface OrganizationSuggestions {
  archiveSuggestions: ArchiveSuggestion[];
  mergeCandidates: MergeCandidate[];
  labelSuggestions: LabelOrganizationSuggestion[];
  cleanupActions: CleanupAction[];
}

// ============================================
// GEMINI CLIENT
// ============================================

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  console.warn('NEXT_PUBLIC_GEMINI_API_KEY not set');
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
      maxOutputTokens: 2048,
    },
  });
}

// ============================================
// HELPERS
// ============================================

function mapNoteDoc(docSnapshot: { id: string; data: () => Record<string, unknown> }): Note {
  const data = docSnapshot.data();
  return {
    id: docSnapshot.id,
    ownerId: (data.ownerId as string) || '',
    spaceId: (data.spaceId as string) || 'personal',
    title: (data.title as string) || '',
    body: (data.body as string) || '',
    type: (data.type as 'text' | 'checklist') || 'text',
    checklist: (data.checklist as ChecklistItem[]) || [],
    color: (data.color as NoteColor) || 'default',
    pinned: (data.pinned as boolean) || false,
    archived: (data.archived as boolean) || false,
    priority: (data.priority as NotePriority) || null,
    labelIds: (data.labelIds as string[]) || [],
    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
    deletedAt: (data.deletedAt as Timestamp)?.toDate() || null,
  };
}

async function getAllNotes(userId: string, spaceId?: string): Promise<Note[]> {
  const notesRef = collection(db, 'users', userId, 'notes');

  let q;
  if (spaceId) {
    q = query(
      notesRef,
      where('spaceId', '==', spaceId),
      where('deletedAt', '==', null),
      orderBy('updatedAt', 'desc'),
      limit(200)
    );
  } else {
    q = query(
      notesRef,
      where('deletedAt', '==', null),
      orderBy('updatedAt', 'desc'),
      limit(200)
    );
  }

  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((doc) => mapNoteDoc({ id: doc.id, data: () => doc.data() }))
    .filter((note) => !note.archived);
}

function getNoteContent(note: Note): string {
  let content = `Title: ${note.title}\n`;

  if (note.body) {
    content += `Body: ${note.body}\n`;
  }

  if (note.type === 'checklist' && note.checklist.length > 0) {
    content += 'Checklist items:\n';
    note.checklist.forEach((item) => {
      const status = item.completed ? '[x]' : '[ ]';
      const priority = item.priority ? ` (${item.priority})` : '';
      const dueDate = item.dueDate ? ` due: ${item.dueDate}` : '';
      content += `  ${status} ${item.text}${priority}${dueDate}\n`;
    });
  }

  if (note.priority) {
    content += `Priority: ${note.priority}\n`;
  }

  return content;
}

function parseJsonResponse<T>(text: string): T | null {
  try {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1].trim());
    }
    // Try to parse as raw JSON
    return JSON.parse(text);
  } catch {
    console.error('Failed to parse AI response as JSON:', text);
    return null;
  }
}

// ============================================
// SUGGESTION FUNCTIONS
// ============================================

/**
 * Suggest labels for a note based on its content
 * Analyzes the note and recommends existing labels that match,
 * as well as suggesting new labels that could be created
 */
export async function suggestLabels(
  userId: string,
  noteId: string,
  _createMissing = false
): Promise<LabelSuggestionResult> {
  const model = getModel();

  // Get the note and existing labels
  const note = await getNote(userId, noteId);
  if (!note) {
    throw new Error('Note not found');
  }

  const existingLabels = await listLabels(userId);
  const noteContent = getNoteContent(note);

  const prompt = `Analyze this note and suggest appropriate labels for organizing it.

Note Content:
${noteContent}

Existing Labels Available:
${existingLabels.map((l) => `- ${l.name} (id: ${l.id})`).join('\n') || 'No existing labels'}

Instructions:
1. Review the note content carefully
2. Match it against existing labels based on topic, context, and relevance
3. Suggest new labels if none of the existing ones fit well
4. Provide confidence scores (0-1) for each suggestion
5. Consider the note's type (text vs checklist), priority, and any dates mentioned

Respond with JSON in this exact format:
{
  "existingLabels": [
    { "id": "label_id", "name": "label_name", "confidence": 0.85 }
  ],
  "suggestedNew": [
    { "name": "suggested_label_name", "reason": "why this label would be useful" }
  ],
  "overallConfidence": 0.8,
  "reasoning": "brief explanation of the analysis"
}

Only include existing labels if they are relevant (confidence > 0.5).
Only suggest new labels if they would genuinely help organize this type of content.`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  const parsed = parseJsonResponse<{
    existingLabels: LabelSuggestion[];
    suggestedNew: NewLabelSuggestion[];
    overallConfidence: number;
    reasoning: string;
  }>(response);

  if (!parsed) {
    return {
      existingLabels: [],
      suggestedNew: [],
      overallConfidence: 0,
    };
  }

  return {
    existingLabels: parsed.existingLabels || [],
    suggestedNew: parsed.suggestedNew || [],
    overallConfidence: parsed.overallConfidence || 0,
  };
}

/**
 * Predict the appropriate priority for a note based on its content and context
 * Analyzes urgency indicators, deadlines, and content importance
 */
export async function predictPriority(
  userId: string,
  noteId: string
): Promise<PriorityPrediction> {
  const model = getModel();

  const note = await getNote(userId, noteId);
  if (!note) {
    throw new Error('Note not found');
  }

  // Get some context from other notes
  const recentNotes = await listNotes(userId, 10, note.spaceId);
  const noteContent = getNoteContent(note);

  const prompt = `Analyze this note and predict what priority level it should have.

Note Content:
${noteContent}

Current Note Priority: ${note.priority || 'not set'}

Context - Other Recent Notes:
${recentNotes
  .filter((n) => n.id !== noteId)
  .slice(0, 5)
  .map((n) => `- "${n.title}" (priority: ${n.priority || 'none'})`)
  .join('\n')}

Instructions:
1. Analyze the content for urgency indicators (deadlines, time-sensitive language)
2. Consider the importance of the topic based on keywords and context
3. Look for action items that need immediate attention
4. Compare with the context of other notes to understand relative importance
5. Consider if it's a checklist with pending items

Factors to consider:
- Deadline mentions (today, tomorrow, this week, urgent)
- Important keywords (critical, ASAP, priority, important, deadline)
- Number of incomplete checklist items
- Whether it appears to be work/professional vs personal
- Dependencies or blockers mentioned

Respond with JSON in this exact format:
{
  "suggestedPriority": "high" | "medium" | "low",
  "reasoning": "detailed explanation of why this priority was chosen",
  "factors": ["factor 1", "factor 2", "factor 3"]
}`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  const parsed = parseJsonResponse<{
    suggestedPriority: 'high' | 'medium' | 'low';
    reasoning: string;
    factors: string[];
  }>(response);

  if (!parsed) {
    return {
      suggestedPriority: 'medium',
      reasoning: 'Unable to analyze note content',
      factors: [],
    };
  }

  return {
    suggestedPriority: parsed.suggestedPriority || 'medium',
    reasoning: parsed.reasoning || '',
    factors: parsed.factors || [],
  };
}

/**
 * Find notes that could be related or linked to the given note
 * Identifies similar topics, projects, or complementary content
 */
export async function suggestRelatedNotes(
  userId: string,
  noteId: string
): Promise<RelatedNotesResult> {
  const model = getModel();

  const note = await getNote(userId, noteId);
  if (!note) {
    throw new Error('Note not found');
  }

  // Get all notes for comparison
  const allNotes = await getAllNotes(userId, note.spaceId);
  const otherNotes = allNotes.filter((n) => n.id !== noteId);

  if (otherNotes.length === 0) {
    return { relatedNotes: [] };
  }

  const noteContent = getNoteContent(note);

  const otherNotesContext = otherNotes
    .slice(0, 30) // Limit to avoid token overflow
    .map((n) => `ID: ${n.id}\nTitle: ${n.title}\nBody Preview: ${(n.body || '').slice(0, 200)}${n.body && n.body.length > 200 ? '...' : ''}\nType: ${n.type}\nPriority: ${n.priority || 'none'}`)
    .join('\n---\n');

  const prompt = `Find notes that are related to the target note.

Target Note:
${noteContent}

Other Notes in the Same Space:
${otherNotesContext}

Instructions:
1. Identify notes that share similar topics, themes, or subjects
2. Look for notes that might be part of the same project or workflow
3. Find notes that could be continuations or follow-ups
4. Identify notes that reference similar concepts
5. Look for complementary content that could be valuable together

Relationship Types:
- similar_topic: Notes about the same or related subjects
- same_project: Notes that appear to be part of the same project or initiative
- continuation: Notes that might be follow-ups or next steps
- reference: Notes that share references, links, or citations
- complement: Notes with different but complementary information

Respond with JSON in this exact format:
{
  "relatedNotes": [
    {
      "id": "note_id",
      "title": "note_title",
      "relationshipType": "similar_topic" | "same_project" | "continuation" | "reference" | "complement",
      "strength": 0.85
    }
  ],
  "reasoning": "brief explanation of relationships found"
}

Only include notes with strength > 0.5. Maximum 10 related notes.`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  const parsed = parseJsonResponse<{
    relatedNotes: RelatedNote[];
    reasoning: string;
  }>(response);

  if (!parsed) {
    return { relatedNotes: [] };
  }

  // Validate that returned note IDs actually exist
  const validNoteIds = new Set(otherNotes.map((n) => n.id));
  const validatedNotes = (parsed.relatedNotes || []).filter((rn) => validNoteIds.has(rn.id));

  return {
    relatedNotes: validatedNotes.slice(0, 10),
  };
}

/**
 * Suggest next actions based on note content
 * Extracts actionable items and recommends follow-up tasks
 */
export async function suggestNextActions(
  userId: string,
  noteId: string
): Promise<NextActionsResult> {
  const model = getModel();

  const note = await getNote(userId, noteId);
  if (!note) {
    throw new Error('Note not found');
  }

  const noteContent = getNoteContent(note);

  const prompt = `Analyze this note and suggest actionable next steps.

Note Content:
${noteContent}

Note Type: ${note.type}
Note Priority: ${note.priority || 'not set'}
Note is Pinned: ${note.pinned}
Created: ${note.createdAt.toISOString()}
Last Updated: ${note.updatedAt.toISOString()}

Instructions:
1. Identify any explicit or implicit action items in the content
2. Look for tasks that need to be done based on the note's context
3. Consider follow-up actions that would be logical next steps
4. If it's a checklist, focus on uncompleted items and what comes after them
5. Consider the note's age and whether any actions might be time-sensitive

Types of actions to suggest:
- Research or gather more information
- Contact someone or follow up
- Create a related note or document
- Schedule a meeting or set a reminder
- Complete pending checklist items
- Review or update the note
- Share with collaborators
- Archive if completed

Respond with JSON in this exact format:
{
  "suggestions": [
    {
      "action": "description of the suggested action",
      "priority": "high" | "medium" | "low",
      "reasoning": "why this action is recommended"
    }
  ],
  "analysis": "brief analysis of the note's actionability"
}

Suggest 3-7 relevant actions, prioritized by importance and urgency.`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  const parsed = parseJsonResponse<{
    suggestions: ActionSuggestion[];
    analysis: string;
  }>(response);

  if (!parsed) {
    return { suggestions: [] };
  }

  return {
    suggestions: parsed.suggestions || [],
  };
}

/**
 * Suggest organization improvements for a space
 * Recommends archiving, merging, labeling, and cleanup actions
 */
export async function suggestOrganization(
  userId: string,
  spaceId?: string
): Promise<OrganizationSuggestions> {
  const model = getModel();

  // Get all notes in the space
  const allNotes = await getAllNotes(userId, spaceId);
  const labels = await listLabels(userId);

  if (allNotes.length === 0) {
    return {
      archiveSuggestions: [],
      mergeCandidates: [],
      labelSuggestions: [],
      cleanupActions: [],
    };
  }

  const notesContext = allNotes
    .slice(0, 50) // Limit to avoid token overflow
    .map((n) => {
      const daysSinceUpdate = Math.floor(
        (Date.now() - n.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      const checklistStatus = n.type === 'checklist'
        ? `Checklist: ${n.checklist.filter((i) => i.completed).length}/${n.checklist.length} completed`
        : '';

      return `ID: ${n.id}
Title: ${n.title}
Body Preview: ${(n.body || '').slice(0, 150)}${n.body && n.body.length > 150 ? '...' : ''}
Type: ${n.type}
Priority: ${n.priority || 'none'}
Pinned: ${n.pinned}
Labels: ${n.labelIds.length > 0 ? n.labelIds.join(', ') : 'none'}
Days Since Update: ${daysSinceUpdate}
${checklistStatus}`;
    })
    .join('\n---\n');

  const labelsContext = labels.length > 0
    ? labels.map((l) => `- ${l.name} (id: ${l.id})`).join('\n')
    : 'No labels defined';

  const prompt = `Analyze these notes and suggest organization improvements.

Notes in Space (${allNotes.length} total, showing first 50):
${notesContext}

Available Labels:
${labelsContext}

Instructions:
1. ARCHIVE SUGGESTIONS: Find notes that should be archived
   - Completed checklists (all items checked)
   - Notes not updated in 30+ days that appear finished
   - Outdated content (past events, old references)

2. MERGE CANDIDATES: Find notes that could be merged
   - Notes with very similar titles
   - Notes about the same topic that could be combined
   - Short notes that could be consolidated

3. LABEL SUGGESTIONS: Find notes that need better labeling
   - Notes without any labels that should have them
   - Notes that match existing label categories

4. CLEANUP ACTIONS: General organization recommendations
   - Prioritization needed
   - Duplicate content
   - Incomplete notes that need attention

Respond with JSON in this exact format:
{
  "archiveSuggestions": [
    {
      "noteId": "note_id",
      "noteTitle": "note_title",
      "reason": "why this should be archived",
      "confidence": 0.85
    }
  ],
  "mergeCandidates": [
    {
      "noteIds": ["id1", "id2"],
      "noteTitles": ["title1", "title2"],
      "reason": "why these should be merged",
      "suggestedTitle": "combined title suggestion"
    }
  ],
  "labelSuggestions": [
    {
      "noteId": "note_id",
      "noteTitle": "note_title",
      "suggestedLabels": ["label1", "label2"],
      "reason": "why these labels fit"
    }
  ],
  "cleanupActions": [
    {
      "type": "archive" | "delete" | "merge" | "label" | "prioritize",
      "description": "what should be done",
      "affectedNotes": ["note_id1", "note_id2"],
      "reason": "why this cleanup is needed"
    }
  ],
  "summary": "overall organization health assessment"
}

Be selective - only suggest high-confidence improvements.
Maximum: 5 archive suggestions, 3 merge candidates, 5 label suggestions, 5 cleanup actions.`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  const parsed = parseJsonResponse<{
    archiveSuggestions: ArchiveSuggestion[];
    mergeCandidates: MergeCandidate[];
    labelSuggestions: LabelOrganizationSuggestion[];
    cleanupActions: CleanupAction[];
    summary: string;
  }>(response);

  if (!parsed) {
    return {
      archiveSuggestions: [],
      mergeCandidates: [],
      labelSuggestions: [],
      cleanupActions: [],
    };
  }

  // Validate that returned note IDs actually exist
  const validNoteIds = new Set(allNotes.map((n) => n.id));

  const validatedArchive = (parsed.archiveSuggestions || []).filter((s) =>
    validNoteIds.has(s.noteId)
  );

  const validatedMerge = (parsed.mergeCandidates || []).filter((m) =>
    m.noteIds.every((id) => validNoteIds.has(id))
  );

  const validatedLabels = (parsed.labelSuggestions || []).filter((s) =>
    validNoteIds.has(s.noteId)
  );

  const validatedCleanup = (parsed.cleanupActions || []).filter((c) =>
    c.affectedNotes.every((id) => validNoteIds.has(id))
  );

  return {
    archiveSuggestions: validatedArchive.slice(0, 5),
    mergeCandidates: validatedMerge.slice(0, 3),
    labelSuggestions: validatedLabels.slice(0, 5),
    cleanupActions: validatedCleanup.slice(0, 5),
  };
}

// ============================================
// BATCH SUGGESTION HELPERS
// ============================================

/**
 * Get quick suggestions for multiple notes at once
 * Useful for displaying suggestions in a list view
 */
export async function getQuickSuggestions(
  userId: string,
  noteIds: string[]
): Promise<Map<string, { hasLabelSuggestions: boolean; hasPriorityIssue: boolean; hasRelatedNotes: boolean }>> {
  const model = getModel();
  const results = new Map<string, { hasLabelSuggestions: boolean; hasPriorityIssue: boolean; hasRelatedNotes: boolean }>();

  // Get all the notes
  const notes: Note[] = [];
  for (const noteId of noteIds.slice(0, 20)) {
    const note = await getNote(userId, noteId);
    if (note) notes.push(note);
  }

  if (notes.length === 0) return results;

  const labels = await listLabels(userId);

  const notesContext = notes.map((n) => ({
    id: n.id,
    title: n.title,
    body: (n.body || '').slice(0, 100),
    type: n.type,
    priority: n.priority,
    labelIds: n.labelIds,
    checklistCompleted: n.type === 'checklist'
      ? n.checklist.filter((i) => i.completed).length === n.checklist.length
      : null,
  }));

  const prompt = `Quickly analyze these notes for potential improvements.

Notes:
${JSON.stringify(notesContext, null, 2)}

Available Labels: ${labels.map((l) => l.name).join(', ') || 'none'}

For each note, determine:
1. hasLabelSuggestions: Could benefit from adding labels (currently has few/none)
2. hasPriorityIssue: Priority seems wrong (urgent content but low/no priority, or trivial content with high priority)
3. hasRelatedNotes: Title/content suggests it might relate to other notes in the list

Respond with JSON:
{
  "notes": [
    {
      "id": "note_id",
      "hasLabelSuggestions": true/false,
      "hasPriorityIssue": true/false,
      "hasRelatedNotes": true/false
    }
  ]
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    const parsed = parseJsonResponse<{
      notes: Array<{
        id: string;
        hasLabelSuggestions: boolean;
        hasPriorityIssue: boolean;
        hasRelatedNotes: boolean;
      }>;
    }>(response);

    if (parsed?.notes) {
      parsed.notes.forEach((n) => {
        results.set(n.id, {
          hasLabelSuggestions: n.hasLabelSuggestions || false,
          hasPriorityIssue: n.hasPriorityIssue || false,
          hasRelatedNotes: n.hasRelatedNotes || false,
        });
      });
    }
  } catch (error) {
    console.error('Failed to get quick suggestions:', error);
  }

  return results;
}

/**
 * Get a summary of organization health for a space
 */
export async function getOrganizationHealth(
  userId: string,
  spaceId?: string
): Promise<{
  score: number;
  issues: string[];
  recommendations: string[];
}> {
  const allNotes = await getAllNotes(userId, spaceId);
  const labels = await listLabels(userId);

  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Check for notes without labels
  const notesWithoutLabels = allNotes.filter((n) => n.labelIds.length === 0);
  if (notesWithoutLabels.length > allNotes.length * 0.5) {
    issues.push(`${notesWithoutLabels.length} notes have no labels`);
    recommendations.push('Add labels to notes for better organization');
    score -= 15;
  }

  // Check for notes without priority
  const notesWithoutPriority = allNotes.filter((n) => !n.priority);
  if (notesWithoutPriority.length > allNotes.length * 0.7) {
    issues.push(`${notesWithoutPriority.length} notes have no priority set`);
    recommendations.push('Set priorities to help focus on important notes');
    score -= 10;
  }

  // Check for old notes that might need archiving
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const oldNotes = allNotes.filter((n) => n.updatedAt < thirtyDaysAgo);
  if (oldNotes.length > 10) {
    issues.push(`${oldNotes.length} notes haven't been updated in 30+ days`);
    recommendations.push('Review old notes and archive completed ones');
    score -= 10;
  }

  // Check for completed checklists that could be archived
  const completedChecklists = allNotes.filter(
    (n) =>
      n.type === 'checklist' &&
      n.checklist.length > 0 &&
      n.checklist.every((i) => i.completed)
  );
  if (completedChecklists.length > 3) {
    issues.push(`${completedChecklists.length} completed checklists could be archived`);
    recommendations.push('Archive completed checklists to reduce clutter');
    score -= 5;
  }

  // Check for underutilized labels
  if (labels.length > 0) {
    const labelUsage = new Map<string, number>();
    allNotes.forEach((n) => {
      n.labelIds.forEach((labelId) => {
        labelUsage.set(labelId, (labelUsage.get(labelId) || 0) + 1);
      });
    });

    const unusedLabels = labels.filter((l) => !labelUsage.has(l.id) || labelUsage.get(l.id) === 0);
    if (unusedLabels.length > 2) {
      issues.push(`${unusedLabels.length} labels are not being used`);
      recommendations.push('Remove or consolidate unused labels');
      score -= 5;
    }
  }

  // Check for potential duplicates (very similar titles)
  const titleCounts = new Map<string, number>();
  allNotes.forEach((n) => {
    const normalizedTitle = n.title.toLowerCase().trim();
    titleCounts.set(normalizedTitle, (titleCounts.get(normalizedTitle) || 0) + 1);
  });

  const duplicateTitles = Array.from(titleCounts.entries()).filter(([_, count]) => count > 1);
  if (duplicateTitles.length > 0) {
    issues.push(`${duplicateTitles.length} potential duplicate notes found`);
    recommendations.push('Review and merge duplicate notes');
    score -= 10;
  }

  return {
    score: Math.max(0, score),
    issues,
    recommendations,
  };
}
