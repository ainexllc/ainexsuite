/**
 * AI Utility Functions
 * Token estimation, prompt validation, and helper utilities
 */

import { encode } from 'gpt-tokenizer';
import type { AITier } from '@ainexsuite/types';

/**
 * AI Usage Limits Configuration
 * Defines quotas for each subscription tier
 */
export const AI_USAGE_LIMITS = {
  free: {
    dailyQueries: 10,
    monthlyQueries: 100,
    queriesPerHour: 5,
    maxPromptLength: 2000,
  },
  basic: {
    dailyQueries: 50,
    monthlyQueries: 1000,
    queriesPerHour: 20,
    maxPromptLength: 5000,
  },
  pro: {
    dailyQueries: 200,
    monthlyQueries: 5000,
    queriesPerHour: 50,
    maxPromptLength: 10000,
  },
  enterprise: {
    dailyQueries: 1000,
    monthlyQueries: 25000,
    queriesPerHour: 200,
    maxPromptLength: 50000,
  },
} as const;

/**
 * Estimate token count for a given text
 * Uses gpt-tokenizer for accurate estimation
 *
 * @param text - Text to estimate tokens for
 * @returns Estimated token count
 */
export function estimateTokens(text: string): number {
  if (!text || text.trim().length === 0) {
    return 0;
  }

  try {
    // Use gpt-tokenizer for accurate token estimation
    const tokens = encode(text);
    return tokens.length;
  } catch (error) {
    // Fallback to rough estimation if tokenizer fails
    // Approximate: 1 token ≈ 4 characters for English text
    console.warn('Token estimation fallback used:', error);
    return Math.ceil(text.length / 4);
  }
}

/**
 * Validate prompt against tier limits
 * Throws error if validation fails
 *
 * @param prompt - Prompt text to validate
 * @param tier - User's subscription tier
 * @throws Error if prompt is invalid
 */
export function validatePrompt(prompt: string, tier: AITier): void {
  const limits = AI_USAGE_LIMITS[tier];

  // Check if prompt is empty
  if (!prompt || prompt.trim().length === 0) {
    throw new Error('Prompt cannot be empty');
  }

  // Check prompt length
  if (prompt.length > limits.maxPromptLength) {
    throw new Error(
      `Prompt exceeds maximum length of ${limits.maxPromptLength} characters for ${tier} tier. Current length: ${prompt.length}`
    );
  }

  // Check for potentially problematic patterns
  const suspiciousPatterns = [
    /ignore previous instructions/i,
    /disregard all previous/i,
    /you are now/i,
    /system:\s*override/i,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(prompt)) {
      throw new Error('Prompt contains potentially problematic content');
    }
  }

  // Check token count (more accurate than character count)
  const tokenCount = estimateTokens(prompt);
  const maxTokens = Math.ceil(limits.maxPromptLength / 4); // Rough token limit

  if (tokenCount > maxTokens) {
    throw new Error(
      `Prompt exceeds maximum token count of ~${maxTokens} tokens for ${tier} tier. Estimated tokens: ${tokenCount}`
    );
  }
}

/**
 * Get usage limits for a tier
 *
 * @param tier - Subscription tier
 * @returns Usage limits configuration
 */
export function getUsageLimits(tier: AITier) {
  return AI_USAGE_LIMITS[tier];
}

/**
 * Calculate remaining queries
 *
 * @param used - Number of queries used
 * @param limit - Maximum allowed queries
 * @returns Number of queries remaining
 */
export function calculateRemaining(used: number, limit: number): number {
  return Math.max(0, limit - used);
}

/**
 * Format ISO date string (YYYY-MM-DD)
 *
 * @param date - Date object (defaults to now)
 * @returns ISO date string
 */
export function formatISODate(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

/**
 * Format ISO month string (YYYY-MM)
 *
 * @param date - Date object (defaults to now)
 * @returns ISO month string
 */
export function formatISOMonth(date: Date = new Date()): string {
  return date.toISOString().substring(0, 7);
}

/**
 * Get next reset time for daily limit
 *
 * @returns ISO date string for next day
 */
export function getNextDailyReset(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return formatISODate(tomorrow);
}

/**
 * Get next reset time for monthly limit
 *
 * @returns ISO month string for next month
 */
export function getNextMonthlyReset(): string {
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  nextMonth.setDate(1);
  nextMonth.setHours(0, 0, 0, 0);
  return formatISOMonth(nextMonth);
}

/**
 * Check if daily reset is needed
 *
 * @param lastReset - Last reset date (ISO format)
 * @returns True if reset is needed
 */
export function needsDailyReset(lastReset: string): boolean {
  const today = formatISODate();
  return lastReset !== today;
}

/**
 * Check if monthly reset is needed
 *
 * @param lastReset - Last reset month (ISO format)
 * @returns True if reset is needed
 */
export function needsMonthlyReset(lastReset: string): boolean {
  const currentMonth = formatISOMonth();
  return lastReset !== currentMonth;
}

/**
 * Sanitize prompt text
 * Remove excessive whitespace and normalize line breaks
 *
 * @param prompt - Raw prompt text
 * @returns Sanitized prompt
 */
export function sanitizePrompt(prompt: string): string {
  return prompt
    .trim()
    .replace(/\r\n/g, '\n') // Normalize line breaks
    .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
    .replace(/[ \t]+/g, ' '); // Collapse multiple spaces
}

/**
 * Truncate text to fit within token limit
 *
 * @param text - Text to truncate
 * @param maxTokens - Maximum token count
 * @returns Truncated text
 */
export function truncateToTokenLimit(text: string, maxTokens: number): string {
  const tokens = estimateTokens(text);

  if (tokens <= maxTokens) {
    return text;
  }

  // Binary search for the right length
  let left = 0;
  let right = text.length;
  let result = text;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    const truncated = text.substring(0, mid);
    const truncatedTokens = estimateTokens(truncated);

    if (truncatedTokens <= maxTokens) {
      result = truncated;
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  return result + '...';
}
