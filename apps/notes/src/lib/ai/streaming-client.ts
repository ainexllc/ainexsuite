/**
 * Streaming Client for Lumi AI Chat
 *
 * Connects to the lumiChatStream Cloud Function for real-time
 * token-by-token responses using Server-Sent Events (SSE).
 */

import { getAuth } from 'firebase/auth';

export interface ToolCall {
  name: string;
  args: Record<string, unknown>;
  id: string;
}

interface StreamingChatOptions {
  query: string;
  systemPrompt?: string;
  messageHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  notesContext?: string;
  onChunk: (chunk: string) => void;
  onToolCall?: (toolCall: ToolCall) => Promise<unknown>;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

// Cloud Function URL for streaming endpoint
// In production, this would be the deployed function URL
const STREAMING_ENDPOINT =
  process.env.NEXT_PUBLIC_FUNCTIONS_URL ||
  'https://us-central1-alnexsuite.cloudfunctions.net/lumiChatStream';

/**
 * Send a message to Lumi with streaming response
 *
 * @param options Chat options including query and callbacks
 * @returns AbortController to cancel the request
 */
export async function streamLumiChat(options: StreamingChatOptions): Promise<AbortController> {
  const { query, systemPrompt, messageHistory, notesContext, onChunk, onToolCall, onError, onComplete } = options;

  const abortController = new AbortController();

  try {
    // Get current user's ID token for authentication
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error('User not authenticated');
    }

    const idToken = await user.getIdToken();

    // Make streaming request
    const response = await fetch(STREAMING_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        query,
        userId: user.uid,
        systemPrompt,
        messageHistory,
        notesContext,
      }),
      signal: abortController.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    // Read the stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let isReading = true;
    while (isReading) {
      const { done, value } = await reader.read();

      if (done) {
        isReading = false;
        onComplete?.();
        continue;
      }

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();

          if (data === '[DONE]') {
            isReading = false;
            onComplete?.();
            continue;
          }

          try {
            const json = JSON.parse(data);

            if (json.error) {
              onError?.(new Error(json.error));
              isReading = false;
              continue;
            }

            // Handle tool calls from the server
            if (json.type === 'tool_call' && json.toolCall && onToolCall) {
              try {
                await onToolCall(json.toolCall as ToolCall);
              } catch (toolError) {
                console.error('[Streaming] Tool call error:', toolError);
              }
              continue;
            }

            if (json.content) {
              onChunk(json.content);
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      // Request was cancelled, don't call onError
      return abortController;
    }

    onError?.(error instanceof Error ? error : new Error('Unknown error'));
  }

  return abortController;
}

/**
 * Check if streaming is available
 * (requires the lumiChatStream Cloud Function to be deployed)
 */
export async function isStreamingAvailable(): Promise<boolean> {
  try {
    const response = await fetch(STREAMING_ENDPOINT, {
      method: 'OPTIONS',
    });
    return response.ok;
  } catch {
    return false;
  }
}
