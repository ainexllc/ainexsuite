/**
 * AI and ML-related types for content enhancement and analysis
 */

export type ContentEnhancementStyle = 'clarity' | 'concise' | 'warmth' | 'reflection';

export interface ContentEnhancementRequest {
  content: string;
  style: ContentEnhancementStyle;
}

export interface ContentEnhancementResponse {
  content: string;
  style: ContentEnhancementStyle;
  usedAI: boolean;
}

/**
 * AI Subscription Tiers
 */
export type AITier = 'free' | 'basic' | 'pro' | 'enterprise';

/**
 * AI Model Providers
 */
export type AIProvider = 'gemini' | 'openai' | 'grok';

/**
 * AI Generation Result
 */
export interface AIGenerationResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
  provider: AIProvider;
  model?: string;
}

/**
 * AI Usage Limits by Tier
 */
export interface AIUsageLimits {
  dailyQueries: number;
  monthlyQueries: number;
  queriesPerHour: number;
  maxPromptLength: number;
}

/**
 * AI Usage Tracking
 */
export interface AIUsageRecord {
  userId: string;
  tier: AITier;
  dailyUsage: number;
  monthlyUsage: number;
  lastResetDaily: string; // ISO date string (YYYY-MM-DD)
  lastResetMonthly: string; // ISO month string (YYYY-MM)
  updatedAt: number; // Timestamp
}

/**
 * AI Usage Check Result
 */
export interface AIUsageCheck {
  allowed: boolean;
  remaining: number;
  dailyRemaining: number;
  monthlyRemaining: number;
  resetDaily: string;
  resetMonthly: string;
}

/**
 * Rate Limit Violation
 */
export class RateLimitError extends Error {
  constructor(
    message: string,
    public readonly retryAfter: number, // seconds until reset
    public readonly remaining: number
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

/**
 * Usage Limit Violation
 */
export class UsageLimitError extends Error {
  constructor(
    message: string,
    public readonly limitType: 'daily' | 'monthly',
    public readonly resetAt: string
  ) {
    super(message);
    this.name = 'UsageLimitError';
  }
}
