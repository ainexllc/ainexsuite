/**
 * Gemini AI Client
 * Primary AI provider with GPT-4o mini fallback
 * Handles content generation with error handling and token tracking
 */

import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import OpenAI from 'openai';
import type { AITier, AIGenerationResult } from '@ainexsuite/types';
import { estimateTokens, validatePrompt, sanitizePrompt } from './utils';

/**
 * Gemini model configuration by tier
 */
const GEMINI_MODELS = {
  free: 'gemini-1.5-flash',
  basic: 'gemini-1.5-flash',
  pro: 'gemini-1.5-pro',
  enterprise: 'gemini-1.5-pro',
} as const;

/**
 * Generation configuration
 */
const GENERATION_CONFIG = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 2048,
};

/**
 * Safety settings (block harmful content)
 */
const SAFETY_SETTINGS = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

/**
 * Gemini client singleton
 */
let geminiClient: GoogleGenerativeAI | null = null;

/**
 * OpenAI client singleton (fallback)
 */
let openaiClient: OpenAI | null = null;

/**
 * Initialize Gemini client
 *
 * @param apiKey - Gemini API key
 * @returns Initialized Gemini client
 */
function initializeGemini(apiKey: string): GoogleGenerativeAI {
  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(apiKey);
  }
  return geminiClient;
}

/**
 * Initialize OpenAI client (fallback)
 *
 * @param apiKey - OpenAI API key
 * @returns Initialized OpenAI client
 */
function initializeOpenAI(apiKey: string): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

/**
 * Generate content using Gemini
 *
 * @param prompt - User prompt
 * @param tier - Subscription tier
 * @param apiKey - Gemini API key
 * @returns Generation result
 */
async function generateWithGemini(
  prompt: string,
  tier: AITier,
  apiKey: string
): Promise<AIGenerationResult> {
  const client = initializeGemini(apiKey);
  const model = client.getGenerativeModel({
    model: GEMINI_MODELS[tier],
    generationConfig: GENERATION_CONFIG,
    safetySettings: SAFETY_SETTINGS,
  });

  // Generate content
  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  // Calculate token usage
  const inputTokens = estimateTokens(prompt);
  const outputTokens = estimateTokens(text);

  return {
    text,
    inputTokens,
    outputTokens,
    provider: 'gemini',
    model: GEMINI_MODELS[tier],
  };
}

/**
 * Generate content using OpenAI (fallback)
 *
 * @param prompt - User prompt
 * @param apiKey - OpenAI API key
 * @returns Generation result
 */
async function generateWithOpenAI(
  prompt: string,
  apiKey: string
): Promise<AIGenerationResult> {
  const client = initializeOpenAI(apiKey);

  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 2048,
  });

  const text = completion.choices[0]?.message?.content || '';
  const inputTokens = completion.usage?.prompt_tokens || estimateTokens(prompt);
  const outputTokens = completion.usage?.completion_tokens || estimateTokens(text);

  return {
    text,
    inputTokens,
    outputTokens,
    provider: 'openai',
    model: 'gpt-4o-mini',
  };
}

/**
 * Generate content with automatic fallback
 * Primary: Gemini, Fallback: GPT-4o mini
 *
 * @param prompt - User prompt (will be validated and sanitized)
 * @param tier - Subscription tier
 * @param geminiApiKey - Gemini API key (optional)
 * @param openaiApiKey - OpenAI API key (optional, for fallback)
 * @returns Generation result with text and token counts
 * @throws Error if validation fails or both providers fail
 */
export async function generateContent(
  prompt: string,
  tier: AITier,
  geminiApiKey?: string,
  openaiApiKey?: string
): Promise<AIGenerationResult> {
  // Validate prompt
  validatePrompt(prompt, tier);

  // Sanitize prompt
  const sanitizedPrompt = sanitizePrompt(prompt);

  // Try Gemini first
  if (geminiApiKey) {
    try {
      return await generateWithGemini(sanitizedPrompt, tier, geminiApiKey);
    } catch (geminiError) {
      console.error('Gemini generation failed:', geminiError);

      // Fall back to OpenAI if available
      if (openaiApiKey) {
        try {
          console.log('Falling back to OpenAI GPT-4o mini');
          return await generateWithOpenAI(sanitizedPrompt, openaiApiKey);
        } catch (openaiError) {
          console.error('OpenAI fallback failed:', openaiError);
          throw new Error(
            'Both Gemini and OpenAI failed. Please try again later.'
          );
        }
      }

      // No fallback available
      throw new Error(
        `Gemini generation failed: ${geminiError instanceof Error ? geminiError.message : 'Unknown error'}`
      );
    }
  }

  // No Gemini key, try OpenAI directly
  if (openaiApiKey) {
    try {
      return await generateWithOpenAI(sanitizedPrompt, openaiApiKey);
    } catch (openaiError) {
      console.error('OpenAI generation failed:', openaiError);
      throw new Error(
        `OpenAI generation failed: ${openaiError instanceof Error ? openaiError.message : 'Unknown error'}`
      );
    }
  }

  // No API keys provided
  throw new Error('No API keys provided. Please configure Gemini or OpenAI API keys.');
}

/**
 * Generate content with streaming support
 * Useful for real-time UI updates
 *
 * @param prompt - User prompt
 * @param tier - Subscription tier
 * @param apiKey - Gemini API key
 * @param onChunk - Callback for each chunk of text
 * @returns Generation result
 */
export async function generateContentStream(
  prompt: string,
  tier: AITier,
  apiKey: string,
  onChunk: (chunk: string) => void
): Promise<AIGenerationResult> {
  // Validate prompt
  validatePrompt(prompt, tier);

  // Sanitize prompt
  const sanitizedPrompt = sanitizePrompt(prompt);

  const client = initializeGemini(apiKey);
  const model = client.getGenerativeModel({
    model: GEMINI_MODELS[tier],
    generationConfig: GENERATION_CONFIG,
    safetySettings: SAFETY_SETTINGS,
  });

  // Generate content with streaming
  const result = await model.generateContentStream(sanitizedPrompt);

  let fullText = '';

  // Process chunks
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    fullText += chunkText;
    onChunk(chunkText);
  }

  // Calculate token usage
  const inputTokens = estimateTokens(sanitizedPrompt);
  const outputTokens = estimateTokens(fullText);

  return {
    text: fullText,
    inputTokens,
    outputTokens,
    provider: 'gemini',
    model: GEMINI_MODELS[tier],
  };
}

/**
 * Count tokens in a prompt (for pre-flight checks)
 *
 * @param prompt - Prompt to count tokens for
 * @param tier - Subscription tier
 * @param apiKey - Gemini API key
 * @returns Token count
 */
export async function countTokens(
  prompt: string,
  tier: AITier,
  apiKey: string
): Promise<number> {
  try {
    const client = initializeGemini(apiKey);
    const model = client.getGenerativeModel({
      model: GEMINI_MODELS[tier],
    });

    const result = await model.countTokens(prompt);
    return result.totalTokens;
  } catch (error) {
    // Fallback to estimation
    console.warn('Token counting failed, using estimation:', error);
    return estimateTokens(prompt);
  }
}

/**
 * Get model information
 *
 * @param tier - Subscription tier
 * @returns Model name for the tier
 */
export function getModelForTier(tier: AITier): string {
  return GEMINI_MODELS[tier];
}

/**
 * Check if API key is valid
 *
 * @param apiKey - API key to validate
 * @param provider - Provider ('gemini' or 'openai')
 * @returns True if valid, false otherwise
 */
export async function validateApiKey(
  apiKey: string,
  provider: 'gemini' | 'openai'
): Promise<boolean> {
  try {
    if (provider === 'gemini') {
      const client = initializeGemini(apiKey);
      const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
      await model.generateContent('test');
      return true;
    } else {
      const client = initializeOpenAI(apiKey);
      await client.models.list();
      return true;
    }
  } catch (error) {
    console.error('API key validation failed:', error);
    return false;
  }
}
