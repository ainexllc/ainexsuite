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

export interface UseGrokAssistantOptions {
  appName: string;
  systemPrompt?: string;
  context?: Record<string, unknown>;
  onError?: (error: Error) => void;
}

export function useGrokAssistant(options: UseGrokAssistantOptions) {
  const { appName, systemPrompt, context, onError } = options;
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
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            appName,
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            systemPrompt,
            context,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to get AI response');
        }

        // Handle streaming response
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
    [user, messages, appName, context, onError, systemPrompt]
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
