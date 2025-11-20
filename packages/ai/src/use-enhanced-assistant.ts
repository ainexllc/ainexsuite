'use client';

/**
 * Enhanced AI assistant hook with cross-app context awareness
 * Automatically includes user data from all 8 apps for comprehensive insights
 */

import { useState, useCallback, useEffect } from 'react';
import { getAggregatedContext, formatContextForAI, type AppContext } from '@ainexsuite/firebase';
import { useGrokAssistant, type UseGrokAssistantOptions } from './use-grok-assistant';

export interface UseEnhancedAssistantOptions extends Omit<UseGrokAssistantOptions, 'context'> {
  includeFullContext?: boolean; // Whether to include all app data (default: false)
  contextApps?: string[]; // Specific apps to include context from
}

export function useEnhancedAssistant(options: UseEnhancedAssistantOptions) {
  const {
    includeFullContext = false,
    contextApps,
    systemPrompt,
    onError,
    ...assistantOptions
  } = options;
  const [appContext, setAppContext] = useState<AppContext | null>(null);
  const [contextLoading, setContextLoading] = useState(false);

  const fetchContext = useCallback(async () => {
    setContextLoading(true);
    try {
      const context = await getAggregatedContext();
      setAppContext(context);
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setContextLoading(false);
    }
  }, [onError]);

  // Fetch aggregated context on mount if includeFullContext is true
  useEffect(() => {
    if (includeFullContext) {
      fetchContext();
    }
  }, [includeFullContext, fetchContext]);

  // Build enhanced system prompt with context
  const enhancedSystemPrompt = useCallback(() => {
    let prompt = systemPrompt || '';

    if (includeFullContext && appContext) {
      prompt += '\n\n' + formatContextForAI(appContext);
      prompt += '\n\nUse this context to provide personalized insights and recommendations based on the user\'s activity across all apps.';
    }

    return prompt;
  }, [systemPrompt, includeFullContext, appContext]);

  // Use the standard Grok assistant with enhanced context
  const mergedContext =
    includeFullContext && appContext
      ? { appContext, contextApps }
      : undefined;

  const assistant = useGrokAssistant({
    ...assistantOptions,
    onError,
    systemPrompt: enhancedSystemPrompt(),
    context: mergedContext,
  });

  return {
    ...assistant,
    appContext,
    contextLoading,
    refreshContext: fetchContext,
  };
}
