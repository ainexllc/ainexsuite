/* eslint-disable no-console */
'use client';

/**
 * React hook for Grok AI assistant integration
 * Provides chat interface with app-specific context injection
 */

import { useState, useCallback, useRef } from 'react';
import { useAuth } from '@ainexsuite/auth';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface FunctionCall {
  name: string;
  args: Record<string, unknown>;
}

export interface UseGrokAssistantOptions {
  appName: string;
  systemPrompt?: string;
  context?: Record<string, unknown>;
  onError?: (error: Error) => void;
  /** Handler for function calls - return the result of executing the function */
  onFunctionCall?: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  /** Whether to enable function calling (tools). Defaults to true. */
  enableTools?: boolean;
  /** Maximum number of messages to send to the API (for context window optimization). Defaults to 16. */
  maxMessages?: number;
}

export function useGrokAssistant(options: UseGrokAssistantOptions) {
  const { appName, systemPrompt, context, onError, onFunctionCall, enableTools = true, maxMessages = 16 } = options;

  // Helper to prune messages for API calls (keeps most recent, preserves pairs)
  const pruneMessages = useCallback((msgs: Message[], max: number): Message[] => {
    if (msgs.length <= max) return msgs;
    // Keep the most recent messages, ensuring we don't cut in the middle of a user-assistant pair
    const pruned = msgs.slice(-max);
    // If first message is assistant (orphaned), remove it
    if (pruned.length > 0 && pruned[0].role === 'assistant') {
      return pruned.slice(1);
    }
    return pruned;
  }, []);
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!user) {
        onError?.(new Error('User not authenticated'));
        return;
      }

      // Add user message
      const userMessage: Message = {
        id: `msg-${Date.now()}-user`,
        role: 'user',
        content,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setLoading(true);
      setStreaming(true);

      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      try {
        // Prune messages to reduce token usage (Phase 1 optimization)
        const allMessages = [...messages, userMessage];
        const prunedMessages = pruneMessages(allMessages, maxMessages);

        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            appName,
            messages: prunedMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            systemPrompt,
            context,
            enableTools,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to get AI response');
        }

        const contentType = response.headers.get('content-type') || '';

        // Handle JSON response (non-streaming, e.g., when tools are enabled)
        if (contentType.includes('application/json')) {
          const json = await response.json();
          console.log('[GrokAssistant] API Response:', { type: json.type, hasFunctionCalls: !!json.functionCalls?.length, text: json.text?.substring(0, 100) });

          // Handle function calls response
          if (json.type === 'function_calls' && json.functionCalls?.length > 0 && onFunctionCall) {
            console.log('[GrokAssistant] Function calls to execute:', json.functionCalls);
            // Execute each function call
            const functionResults = await Promise.all(
              json.functionCalls.map(async (fc: FunctionCall) => {
                console.log('[GrokAssistant] Executing function:', fc.name, 'with args:', fc.args);
                try {
                  const result = await onFunctionCall(fc.name, fc.args);
                  console.log('[GrokAssistant] Function result:', fc.name, result);
                  return { name: fc.name, response: result };
                } catch (err) {
                  console.error('[GrokAssistant] Function error:', fc.name, err);
                  return { name: fc.name, response: { error: String(err) } };
                }
              })
            );
            console.log('[GrokAssistant] All function results:', functionResults);

            // Send function results back to API for final response
            const continueResponse = await fetch('/api/ai/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                appName,
                messages: prunedMessages.map((m) => ({
                  role: m.role,
                  content: m.content,
                })),
                systemPrompt,
                context,
                enableTools,
                functionResults,
              }),
              signal: abortControllerRef.current?.signal,
            });

            if (!continueResponse.ok) {
              throw new Error('Failed to get AI response after function call');
            }

            const finalJson = await continueResponse.json();

            const assistantMessage: Message = {
              id: `msg-${Date.now()}-assistant`,
              role: 'assistant',
              content: finalJson.content || finalJson.text || 'Done!',
              timestamp: Date.now(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
            setStreaming(false);
            setLoading(false);
            return;
          }

          // Handle simple text response
          const assistantMessage: Message = {
            id: `msg-${Date.now()}-assistant`,
            role: 'assistant',
            content: json.content || json.text || '',
            timestamp: Date.now(),
          };

          setMessages((prev) => [...prev, assistantMessage]);
          setStreaming(false);
          setLoading(false);
          return;
        }

        // Handle streaming response (SSE format)
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('No response body');
        }

        let assistantContent = '';
        const assistantMessage: Message = {
          id: `msg-${Date.now()}-assistant`,
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
        };

        // Add empty assistant message that we'll update
        setMessages((prev) => [...prev, assistantMessage]);

        let isReading = true;
        while (isReading) {
          const { done, value } = await reader.read();

          if (done) {
            setStreaming(false);
            setLoading(false);
            isReading = false;
            continue;
          }

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);

              if (data === '[DONE]') {
                continue;
              }

              try {
                const json = JSON.parse(data);
                const content = json.content || '';
                assistantContent += content;

                // Update assistant message
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMessage.id
                      ? { ...m, content: assistantContent }
                      : m
                  )
                );
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            // Request was cancelled
            return;
          }
          onError?.(error);
        }
        setLoading(false);
        setStreaming(false);
      }
    },
    [user, messages, appName, context, onError, systemPrompt, onFunctionCall, enableTools, pruneMessages, maxMessages]
  );

  const cancelRequest = useCallback(() => {
    abortControllerRef.current?.abort();
    setLoading(false);
    setStreaming(false);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    loading,
    streaming,
    sendMessage,
    cancelRequest,
    clearMessages,
  };
}
