/**
 * AI Library - Main Export
 *
 * Provides AI capabilities powered by xAI's Grok (grok-beta model)
 *
 * @example
 * ```ts
 * import { getGrokClient, generateText, summarizeText } from '@/lib/ai';
 *
 * // Direct client usage
 * const client = getGrokClient();
 * const response = await client.ask("What is AI?");
 *
 * // Helper functions
 * const summary = await summarizeText({ text: longArticle });
 * const enhanced = await enhanceContent({ text: draft, task: "improve" });
 * ```
 */

// Export client
export { GrokClient, getGrokClient, type GrokMessage, type GrokCompletionOptions, type GrokCompletionResponse } from "./grok-client";

// Export helper functions
export {
  generateText,
  summarizeText,
  enhanceContent,
  answerQuestion,
  generateCreativeContent,
  analyzeSentiment,
  extractKeyInfo,
  generateSuggestions,
  translateText,
  checkGrammar,
  type TextGenerationOptions,
  type SummarizationOptions,
  type ContentEnhancementOptions,
  type QuestionAnswerOptions,
} from "./helpers";
