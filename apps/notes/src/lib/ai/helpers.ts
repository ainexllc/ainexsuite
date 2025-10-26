/**
 * AI Helper Functions
 * Provides ready-to-use AI capabilities for common app features
 */

import { getGrokClient, type GrokMessage } from "./grok-client";

export interface TextGenerationOptions {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface SummarizationOptions {
  text: string;
  maxLength?: number;
  style?: "brief" | "detailed" | "bullet-points";
}

export interface ContentEnhancementOptions {
  text: string;
  task: "improve" | "simplify" | "expand" | "rewrite";
  tone?: "professional" | "casual" | "friendly" | "formal";
}

export interface QuestionAnswerOptions {
  question: string;
  context?: string;
  conversationHistory?: GrokMessage[];
}

/**
 * Generate text based on a prompt
 */
export async function generateText(options: TextGenerationOptions): Promise<string> {
  const client = getGrokClient();
  const { prompt, systemPrompt, temperature, maxTokens } = options;

  return client.ask(prompt, systemPrompt);
}

/**
 * Summarize long text content
 */
export async function summarizeText(options: SummarizationOptions): Promise<string> {
  const client = getGrokClient();
  const { text, maxLength = 200, style = "brief" } = options;

  const styleInstructions = {
    brief: "Provide a concise 1-2 sentence summary.",
    detailed: "Provide a comprehensive summary covering all key points.",
    "bullet-points": "Summarize in bullet points, highlighting the main ideas.",
  };

  const systemPrompt = `You are a text summarization expert. ${styleInstructions[style]} Keep the summary under ${maxLength} words.`;

  return client.ask(`Summarize the following text:\n\n${text}`, systemPrompt);
}

/**
 * Enhance or modify existing content
 */
export async function enhanceContent(options: ContentEnhancementOptions): Promise<string> {
  const client = getGrokClient();
  const { text, task, tone = "professional" } = options;

  const taskInstructions = {
    improve: `Improve the following text by making it clearer, more engaging, and better structured. Maintain a ${tone} tone.`,
    simplify: `Simplify the following text to make it easier to understand. Use plain language and maintain a ${tone} tone.`,
    expand: `Expand the following text with more details, examples, and explanations. Maintain a ${tone} tone.`,
    rewrite: `Rewrite the following text in a different way while keeping the same meaning. Use a ${tone} tone.`,
  };

  const systemPrompt = "You are a professional content editor and writer.";
  const prompt = `${taskInstructions[task]}\n\nText: ${text}`;

  return client.ask(prompt, systemPrompt);
}

/**
 * Answer questions with optional context
 */
export async function answerQuestion(options: QuestionAnswerOptions): Promise<string> {
  const client = getGrokClient();
  const { question, context, conversationHistory } = options;

  const messages: GrokMessage[] = conversationHistory || [];

  if (context && !conversationHistory) {
    messages.push({
      role: "system",
      content: `Answer questions based on the following context:\n\n${context}`,
    });
  }

  messages.push({
    role: "user",
    content: question,
  });

  const response = await client.createCompletion({ messages });
  return response.choices[0]?.message?.content || "";
}

/**
 * Generate creative content (stories, ideas, etc.)
 */
export async function generateCreativeContent(
  prompt: string,
  type: "story" | "idea" | "poem" | "code" | "custom" = "custom"
): Promise<string> {
  const client = getGrokClient();

  const typeInstructions = {
    story: "You are a creative storyteller. Write an engaging story based on the prompt.",
    idea: "You are a creative brainstorming assistant. Generate innovative ideas based on the prompt.",
    poem: "You are a poet. Write a beautiful poem based on the prompt.",
    code: "You are an expert programmer. Generate clean, well-documented code based on the prompt.",
    custom: "You are a helpful AI assistant.",
  };

  return client.ask(prompt, typeInstructions[type]);
}

/**
 * Analyze sentiment of text
 */
export async function analyzeSentiment(text: string): Promise<{
  sentiment: "positive" | "negative" | "neutral";
  confidence: number;
  explanation: string;
}> {
  const client = getGrokClient();

  const systemPrompt = `You are a sentiment analysis expert. Analyze the sentiment of the text and respond ONLY with a JSON object in this exact format:
{
  "sentiment": "positive" | "negative" | "neutral",
  "confidence": <number between 0 and 1>,
  "explanation": "<brief explanation>"
}`;

  const response = await client.ask(`Analyze the sentiment of this text:\n\n${text}`, systemPrompt);

  try {
    return JSON.parse(response);
  } catch {
    return {
      sentiment: "neutral",
      confidence: 0.5,
      explanation: "Could not parse sentiment analysis",
    };
  }
}

/**
 * Extract key information from text
 */
export async function extractKeyInfo(
  text: string,
  infoType: "keywords" | "entities" | "dates" | "numbers" | "all" = "all"
): Promise<string[]> {
  const client = getGrokClient();

  const instructions = {
    keywords: "Extract the most important keywords",
    entities: "Extract named entities (people, places, organizations)",
    dates: "Extract all dates and time references",
    numbers: "Extract all important numbers and statistics",
    all: "Extract all key information including keywords, entities, dates, and numbers",
  };

  const systemPrompt = `You are an information extraction expert. ${instructions[infoType]} from the text. Return ONLY a JSON array of strings, like: ["item1", "item2", "item3"]`;

  const response = await client.ask(`Extract information from this text:\n\n${text}`, systemPrompt);

  try {
    return JSON.parse(response);
  } catch {
    return [];
  }
}

/**
 * Generate suggestions or recommendations
 */
export async function generateSuggestions(
  context: string,
  count: number = 5
): Promise<string[]> {
  const client = getGrokClient();

  const systemPrompt = `You are a helpful suggestion assistant. Generate ${count} relevant suggestions based on the context. Return ONLY a JSON array of strings, like: ["suggestion1", "suggestion2", ...]`;

  const response = await client.ask(
    `Generate ${count} suggestions based on this context:\n\n${context}`,
    systemPrompt
  );

  try {
    return JSON.parse(response);
  } catch {
    return [];
  }
}

/**
 * Translate text to another language
 */
export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage: string = "auto"
): Promise<string> {
  const client = getGrokClient();

  const systemPrompt = `You are a professional translator. Translate the text ${sourceLanguage !== "auto" ? `from ${sourceLanguage}` : ""} to ${targetLanguage}. Provide ONLY the translation, without any additional commentary.`;

  return client.ask(`Translate this text:\n\n${text}`, systemPrompt);
}

/**
 * Check grammar and provide corrections
 */
export async function checkGrammar(text: string): Promise<{
  correctedText: string;
  corrections: Array<{ original: string; corrected: string; explanation: string }>;
}> {
  const client = getGrokClient();

  const systemPrompt = `You are a grammar expert. Check the text for grammar errors and respond ONLY with a JSON object in this format:
{
  "correctedText": "<the fully corrected text>",
  "corrections": [
    {
      "original": "<original phrase>",
      "corrected": "<corrected phrase>",
      "explanation": "<brief explanation>"
    }
  ]
}`;

  const response = await client.ask(`Check the grammar of this text:\n\n${text}`, systemPrompt);

  try {
    return JSON.parse(response);
  } catch {
    return {
      correctedText: text,
      corrections: [],
    };
  }
}
