/**
 * AI Integration Helper
 * Complete AI integration with rate limiting, usage tracking, and fallback
 * This is the recommended way to integrate AI in your apps
 */

import type { Firestore } from 'firebase/firestore';
import type { AITier, AIGenerationResult } from '@ainexsuite/types';
import { RateLimitError, UsageLimitError } from '@ainexsuite/types';
import { generateContent } from './gemini-client';
import { checkRateLimit } from './rate-limiter';
import { checkUsageLimit, incrementUsage } from './usage-tracker';

/**
 * AI Integration Configuration
 */
export interface AIIntegrationConfig {
  geminiApiKey?: string;
  openaiApiKey?: string;
  db: Firestore;
}

/**
 * AI Request Options
 */
export interface AIRequestOptions {
  userId: string;
  tier: AITier;
  prompt: string;
}

/**
 * AI Response with metadata
 */
export interface AIResponse {
  success: boolean;
  result?: AIGenerationResult;
  error?: {
    type: 'rate_limit' | 'usage_limit' | 'validation' | 'generation' | 'unknown';
    message: string;
    retryAfter?: number;
    resetAt?: string;
  };
  usage?: {
    dailyRemaining: number;
    monthlyRemaining: number;
  };
}

/**
 * Unified AI integration function
 * Handles rate limiting, usage tracking, and generation with proper error handling
 *
 * @param config - AI integration configuration
 * @param options - Request options
 * @returns AI response with result or error
 */
export async function generateAIContent(
  config: AIIntegrationConfig,
  options: AIRequestOptions
): Promise<AIResponse> {
  const { geminiApiKey, openaiApiKey, db } = config;
  const { userId, tier, prompt } = options;

  try {
    // Step 1: Check rate limit (in-memory, fast)
    checkRateLimit(userId, tier);

    // Step 2: Check usage limit (Firestore, atomic)
    await checkUsageLimit(db, userId, tier);

    // Step 3: Generate content
    const result = await generateContent(prompt, tier, geminiApiKey, openaiApiKey);

    // Step 4: Increment usage counters
    const updatedUsage = await incrementUsage(db, userId, tier);

    return {
      success: true,
      result,
      usage: {
        dailyRemaining: updatedUsage.dailyRemaining,
        monthlyRemaining: updatedUsage.monthlyRemaining,
      },
    };
  } catch (error) {
    // Handle rate limit errors
    if (error instanceof RateLimitError) {
      return {
        success: false,
        error: {
          type: 'rate_limit',
          message: error.message,
          retryAfter: error.retryAfter,
        },
      };
    }

    // Handle usage limit errors
    if (error instanceof UsageLimitError) {
      return {
        success: false,
        error: {
          type: 'usage_limit',
          message: error.message,
          resetAt: error.resetAt,
        },
      };
    }

    // Handle validation errors
    if (error instanceof Error && error.message.includes('Prompt')) {
      return {
        success: false,
        error: {
          type: 'validation',
          message: error.message,
        },
      };
    }

    // Handle generation errors
    if (error instanceof Error && error.message.includes('generation')) {
      return {
        success: false,
        error: {
          type: 'generation',
          message: error.message,
        },
      };
    }

    // Unknown errors
    return {
      success: false,
      error: {
        type: 'unknown',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
      },
    };
  }
}

/**
 * Batch AI generation with automatic retry and backoff
 * Useful for processing multiple prompts efficiently
 *
 * @param config - AI integration configuration
 * @param requests - Array of request options
 * @param options - Batch options
 * @returns Array of responses
 */
export async function generateAIContentBatch(
  config: AIIntegrationConfig,
  requests: AIRequestOptions[],
  options?: {
    maxConcurrent?: number;
    retryOnRateLimit?: boolean;
    retryDelay?: number;
  }
): Promise<AIResponse[]> {
  const maxConcurrent = options?.maxConcurrent || 3;
  const retryOnRateLimit = options?.retryOnRateLimit ?? true;
  const retryDelay = options?.retryDelay || 5000;

  const results: AIResponse[] = [];
  const queue = [...requests];

  // Process in batches
  while (queue.length > 0) {
    const batch = queue.splice(0, maxConcurrent);
    const batchResults = await Promise.all(
      batch.map((request) => generateAIContent(config, request))
    );

    for (let i = 0; i < batchResults.length; i++) {
      const result = batchResults[i];

      // Retry rate-limited requests
      if (
        retryOnRateLimit &&
        result.error?.type === 'rate_limit' &&
        result.error?.retryAfter
      ) {
        await new Promise((resolve) =>
          setTimeout(resolve, (result.error?.retryAfter || 0) * 1000 + retryDelay)
        );
        queue.push(batch[i]); // Re-add to queue
      } else {
        results.push(result);
      }
    }
  }

  return results;
}

/**
 * Pre-flight check before making AI request
 * Useful for UI to show warnings before expensive operations
 *
 * @param config - AI integration configuration
 * @param options - Request options (without prompt)
 * @returns Check result with recommendations
 */
export async function checkAIAvailability(
  config: AIIntegrationConfig,
  options: Omit<AIRequestOptions, 'prompt'>
): Promise<{
  available: boolean;
  reason?: string;
  usage?: {
    dailyRemaining: number;
    monthlyRemaining: number;
  };
}> {
  const { db } = config;
  const { userId, tier } = options;

  try {
    // Check rate limit (without recording)
    checkRateLimit(userId, tier);

    // Check usage limit (without incrementing)
    const usageCheck = await checkUsageLimit(db, userId, tier);

    return {
      available: true,
      usage: {
        dailyRemaining: usageCheck.dailyRemaining,
        monthlyRemaining: usageCheck.monthlyRemaining,
      },
    };
  } catch (error) {
    if (error instanceof RateLimitError) {
      return {
        available: false,
        reason: error.message,
      };
    }

    if (error instanceof UsageLimitError) {
      return {
        available: false,
        reason: error.message,
      };
    }

    return {
      available: false,
      reason: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
