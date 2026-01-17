/* eslint-disable no-console */
/**
 * Lumi AI Chat Function with Genkit Streaming
 *
 * Provides real-time streaming responses for the Notes AI assistant.
 * Uses Firebase Genkit with Gemini for low-latency, token-by-token delivery.
 *
 * @see https://firebase.google.com/docs/genkit
 */

import { genkit, z } from 'genkit';
import { googleAI, gemini20Flash } from '@genkit-ai/googleai';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Genkit with Google AI plugin
const ai = genkit({
  plugins: [googleAI()],
});

// ============================================================================
// GENKIT TOOL DEFINITIONS
// These tools are executed CLIENT-SIDE - we just define them for the AI
// ============================================================================

const createNoteTool = ai.defineTool(
  {
    name: 'create_note',
    description: 'Create a new note or checklist. For checklists, use items array instead of body.',
    inputSchema: z.object({
      title: z.string().describe('Note title'),
      body: z.string().optional().describe('Note body content (for text notes)'),
      type: z.enum(['text', 'checklist']).optional().default('text'),
      items: z.array(z.string()).optional().describe('Checklist items (for checklist type)'),
      color: z.string().optional().describe('Note color (note-blue, note-red, etc.)'),
      pinned: z.boolean().optional().default(false),
      priority: z.enum(['high', 'medium', 'low']).optional(),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      noteId: z.string().optional(),
    }),
  },
  async (_input) => {
    // This will be handled client-side - return pending status
    return { success: true, message: `Tool call: create_note`, noteId: 'pending' };
  }
);

const updateNoteTool = ai.defineTool(
  {
    name: 'update_note',
    description: 'Update an existing note by ID',
    inputSchema: z.object({
      noteId: z.string().describe('The note ID to update'),
      title: z.string().optional(),
      body: z.string().optional(),
      items: z.array(z.string()).optional().describe('New checklist items'),
      color: z.string().optional(),
      pinned: z.boolean().optional(),
      archived: z.boolean().optional(),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
  async (_input) => {
    return { success: true, message: `Tool call: update_note` };
  }
);

const deleteNoteTool = ai.defineTool(
  {
    name: 'delete_note',
    description: 'Move a note to trash',
    inputSchema: z.object({
      noteId: z.string().describe('The note ID to delete'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
  async (_input) => {
    return { success: true, message: `Tool call: delete_note` };
  }
);

const togglePinTool = ai.defineTool(
  {
    name: 'toggle_pin',
    description: 'Pin or unpin a note (also handles favorite/heart requests)',
    inputSchema: z.object({
      noteId: z.string().describe('The note ID'),
      pinned: z.boolean().describe('True to pin, false to unpin'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
  async (_input) => {
    return { success: true, message: `Tool call: toggle_pin` };
  }
);

const toggleArchiveTool = ai.defineTool(
  {
    name: 'toggle_archive',
    description: 'Archive or unarchive a note',
    inputSchema: z.object({
      noteId: z.string().describe('The note ID'),
      archived: z.boolean().describe('True to archive, false to unarchive'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
  async (_input) => {
    return { success: true, message: `Tool call: toggle_archive` };
  }
);

const moveNoteTool = ai.defineTool(
  {
    name: 'move_note',
    description: 'Move a note to a different space',
    inputSchema: z.object({
      noteId: z.string().describe('The note ID'),
      targetSpaceId: z.string().describe('The target space ID'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
  async (_input) => {
    return { success: true, message: `Tool call: move_note` };
  }
);

const changeColorTool = ai.defineTool(
  {
    name: 'change_note_color',
    description: 'Change the color of a note',
    inputSchema: z.object({
      noteId: z.string().describe('The note ID'),
      color: z.string().describe('Color: note-blue, note-red, note-green, note-yellow, note-orange, note-pink, note-purple, note-cyan, note-teal, note-gray, default'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
  async (_input) => {
    return { success: true, message: `Tool call: change_note_color` };
  }
);

const duplicateNoteTool = ai.defineTool(
  {
    name: 'duplicate_note',
    description: 'Create a copy of an existing note',
    inputSchema: z.object({
      noteId: z.string().describe('The note ID to duplicate'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      newNoteId: z.string().optional(),
    }),
  },
  async (_input) => {
    return { success: true, message: `Tool call: duplicate_note` };
  }
);

const changePriorityTool = ai.defineTool(
  {
    name: 'change_note_priority',
    description: 'Set the priority level of a note',
    inputSchema: z.object({
      noteId: z.string().describe('The note ID'),
      priority: z.enum(['high', 'medium', 'low', 'none']).describe('Priority level'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
  async (_input) => {
    return { success: true, message: `Tool call: change_note_priority` };
  }
);

const manageLabelsTool = ai.defineTool(
  {
    name: 'manage_note_labels',
    description: 'Add, remove, or set labels on a note',
    inputSchema: z.object({
      noteId: z.string().describe('The note ID'),
      action: z.enum(['add', 'remove', 'set']).describe('add=add labels, remove=remove labels, set=replace all'),
      labelNames: z.array(z.string()).describe('Label names to add/remove/set'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
  async (_input) => {
    return { success: true, message: `Tool call: manage_note_labels` };
  }
);

const getNoteContentTool = ai.defineTool(
  {
    name: 'get_note_content',
    description: 'Get the full content of a note by ID (use when preview is truncated)',
    inputSchema: z.object({
      noteId: z.string().describe('The note ID'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      note: z.object({
        id: z.string(),
        title: z.string(),
        content: z.string(),
        type: z.string(),
      }).optional(),
      error: z.string().optional(),
    }),
  },
  async (_input) => {
    return { success: true, message: `Tool call: get_note_content` };
  }
);

const searchNotesSemanticTool = ai.defineTool(
  {
    name: 'search_notes_semantic',
    description: 'Search notes by meaning/semantic similarity',
    inputSchema: z.object({
      query: z.string().describe('Search query'),
      limit: z.number().optional().default(5).describe('Max results'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      results: z.array(z.object({
        id: z.string(),
        title: z.string(),
        preview: z.string(),
        relevanceScore: z.number(),
      })),
      message: z.string(),
    }),
  },
  async (_input) => {
    return { success: true, results: [], message: `Tool call: search_notes_semantic` };
  }
);

// All tools for streaming
const LUMI_TOOLS = [
  createNoteTool,
  updateNoteTool,
  deleteNoteTool,
  togglePinTool,
  toggleArchiveTool,
  moveNoteTool,
  changeColorTool,
  duplicateNoteTool,
  changePriorityTool,
  manageLabelsTool,
  getNoteContentTool,
  searchNotesSemanticTool,
];

// Types for chat messages
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface LumiChatRequest {
  query: string;
  userId: string;
  systemPrompt?: string;
  messageHistory?: ChatMessage[];
  notesContext?: string;
}

interface SearchRequest {
  query: string;
  userId: string;
  limit?: number;
}

// Default system prompt for Lumi
const LUMI_SYSTEM_PROMPT = `You are AINex (Lumi), the Notes app AI assistant. Be concise and helpful.

CONTEXT FORMAT:
Notes are in compact format: ID|Title|Type|Flags|Labels|Preview
- Type: TX=text, CL=checklist
- Flags: 📌=pinned, ❗=high priority, ⚡=medium priority
- Use ID_LOOKUP section to find note IDs for tool calls

KEY RULES:
1. NEVER show IDs to users - always use note titles and space names
2. Match notes by title/content keywords when user describes them
3. For checklists: use items array, NOT body field
4. "Pin", "favorite", "heart" are synonyms → toggle_pin with pinned=true

RESPONSE STYLE:
- Concise, scannable
- Quote note titles ("Shopping List")
- Show checklist progress (3/5 done)
- Confirm actions completed`;

/**
 * Lumi Chat - Streaming AI responses for Notes app
 *
 * Uses Genkit for AI generation with streaming support.
 * Returns a ReadableStream for token-by-token delivery.
 */
export const lumiChat = functions
  .region('us-central1')
  .runWith({ timeoutSeconds: 120, memory: '512MB', secrets: ['GOOGLE_API_KEY'] })
  .https.onCall(async (data: LumiChatRequest, context: functions.https.CallableContext) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    const { query, systemPrompt, messageHistory = [], notesContext } = data;

    // Build full system prompt with context
    const fullPrompt = [
      systemPrompt || LUMI_SYSTEM_PROMPT,
      notesContext ? `\n\n${notesContext}` : '',
    ].join('');

    // Build message history for Genkit format
    const messages = messageHistory.map((msg) => ({
      role: msg.role === 'user' ? 'user' as const : 'model' as const,
      content: [{ text: msg.content }],
    }));

    try {
      // Generate response with Genkit
      const { text } = await ai.generate({
        model: gemini20Flash,
        system: fullPrompt,
        messages: [
          ...messages,
          { role: 'user' as const, content: [{ text: query }] },
        ],
        config: {
          temperature: 0.7,
          maxOutputTokens: 2000,
        },
      });

      return {
        content: text || 'No response generated',
        streaming: false, // Standard callable doesn't support streaming
      };
    } catch (error) {
      console.error('[lumiChat] Error:', error);
      throw new functions.https.HttpsError('internal', 'AI generation failed');
    }
  });

/**
 * Lumi Chat Streaming - Real-time token delivery
 *
 * Uses HTTP streaming for token-by-token responses.
 * Called from the client via fetch with stream: true.
 */
export const lumiChatStream = functions
  .region('us-central1')
  .runWith({ timeoutSeconds: 120, memory: '512MB', secrets: ['GOOGLE_API_KEY'] })
  .https.onRequest(async (req, res) => {
    // CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).send('Method not allowed');
      return;
    }

    // Verify authorization
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).send('Unauthorized');
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
      // Verify token but we don't need the uid for streaming
      await admin.auth().verifyIdToken(idToken);
    } catch {
      res.status(401).send('Invalid token');
      return;
    }

    const { query, systemPrompt, messageHistory = [], notesContext } = req.body as LumiChatRequest;

    // Build full system prompt with context
    const fullPrompt = [
      systemPrompt || LUMI_SYSTEM_PROMPT,
      notesContext ? `\n\n${notesContext}` : '',
    ].join('');

    // Build message history for Genkit format
    const messages = messageHistory.map((msg: ChatMessage) => ({
      role: msg.role === 'user' ? 'user' as const : 'model' as const,
      content: [{ text: msg.content }],
    }));

    // Set up streaming response
    res.set('Content-Type', 'text/event-stream');
    res.set('Cache-Control', 'no-cache');
    res.set('Connection', 'keep-alive');

    try {
      // Generate streaming response with Genkit and tools
      // returnToolRequests: true prevents auto-execution - we handle tools client-side
      const { stream, response } = await ai.generateStream({
        model: gemini20Flash,
        system: fullPrompt,
        messages: [
          ...messages,
          { role: 'user' as const, content: [{ text: query }] },
        ],
        tools: LUMI_TOOLS,
        returnToolRequests: true, // Don't auto-execute, return to client
        config: {
          temperature: 0.7,
          maxOutputTokens: 2000,
        },
      });

      // Stream tokens to client
      for await (const chunk of stream) {
        const text = chunk.text || '';
        if (text) {
          res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
        }
      }

      // After streaming, check for tool calls in the final response
      const finalResponse = await response;
      const toolRequests = finalResponse.toolRequests || [];

      console.log('[lumiChatStream] Tool requests:', JSON.stringify(toolRequests, null, 2));
      console.log('[lumiChatStream] Full response keys:', Object.keys(finalResponse));

      if (toolRequests.length > 0) {
        console.log('[lumiChatStream] Sending', toolRequests.length, 'tool calls to client');
        // Send tool calls to client for execution
        for (const request of toolRequests) {
          const { toolRequest } = request;
          const toolCallData = {
            type: 'tool_call',
            toolCall: {
              name: toolRequest.name,
              args: toolRequest.input,
              id: toolRequest.ref || `tool_${Date.now()}`,
            },
          };
          console.log('[lumiChatStream] Sending tool call:', JSON.stringify(toolCallData));
          res.write(`data: ${JSON.stringify(toolCallData)}\n\n`);
        }
      } else {
        console.log('[lumiChatStream] No tool requests found');
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      console.error('[lumiChatStream] Error:', error);
      res.write(`data: ${JSON.stringify({ error: 'AI generation failed' })}\n\n`);
      res.end();
    }
  });

/**
 * Search notes with keyword matching
 * (Semantic search requires Vector Search Extension)
 */
export const searchNotesAI = functions
  .region('us-central1')
  .https.onCall(async (data: SearchRequest, context: functions.https.CallableContext) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    const { query, userId, limit = 5 } = data;

    try {
      const db = admin.firestore();
      const notesRef = db.collection(`users/${userId}/notes`);

      // Get recent non-archived notes
      const snapshot = await notesRef
        .where('archived', '==', false)
        .orderBy('updatedAt', 'desc')
        .limit(limit * 2)
        .get();

      // Keyword-based scoring
      const queryLower = query.toLowerCase();
      const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 2);

      const results = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          let score = 0;

          const title = (data.title || '').toLowerCase();
          const body = (data.body || '').toLowerCase();

          for (const word of queryWords) {
            if (title.includes(word)) score += 3;
            if (body.includes(word)) score += 1;
          }

          if (data.pinned) score += 0.5;

          return {
            id: doc.id,
            title: data.title || 'Untitled',
            preview: (data.body || '').slice(0, 100),
            score,
          };
        })
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      return { results };
    } catch (error) {
      console.error('[searchNotesAI] Error:', error);
      throw new functions.https.HttpsError('internal', 'Search failed');
    }
  });
