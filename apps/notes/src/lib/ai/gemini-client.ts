/**
 * Gemini AI Client for Notes
 * Uses Gemini 3 Flash Preview with function calling support
 */

import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
  type FunctionDeclaration,
  type FunctionCall,
  type Part,
  type Content,
} from '@google/generative-ai';

// Use Gemini 3 Flash Preview
const MODEL_NAME = 'gemini-2.0-flash';

// Use the same API key pattern as main app
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

// Using SDK's Content type directly for history
// GeminiMessage is an alias for convenience
export type GeminiMessage = Content;

export interface GeminiCompletionOptions {
  messages: Array<{ role: string; content: string }>;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  tools?: FunctionDeclaration[];
}

export interface FunctionCallResult {
  functionCalls: FunctionCall[];
  text: string;
}

/**
 * Safety settings - allow most content for note assistance
 */
const SAFETY_SETTINGS = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
];

export class GeminiClient {
  private client: GoogleGenerativeAI;

  constructor(overrideApiKey?: string) {
    const key = overrideApiKey || apiKey;
    if (!key) {
      throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not configured');
    }
    this.client = new GoogleGenerativeAI(key);
  }

  /**
   * Create a streaming chat completion (without function calling)
   */
  async *createStreamingCompletion(
    options: GeminiCompletionOptions
  ): AsyncGenerator<string, void, unknown> {
    const { messages, systemPrompt, temperature = 0.7, maxTokens = 2000 } = options;

    const model = this.client.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
        topP: 0.95,
        topK: 40,
      },
      safetySettings: SAFETY_SETTINGS,
      systemInstruction: systemPrompt,
    });

    // Convert messages to Gemini format (history + latest message)
    const history: GeminiMessage[] = [];
    let latestUserMessage = '';

    for (const msg of messages) {
      if (msg.role === 'system') continue; // System prompt handled separately

      if (msg.role === 'user') {
        latestUserMessage = msg.content;
      } else if (msg.role === 'assistant') {
        // Add previous user message to history if we have one
        if (latestUserMessage) {
          history.push({
            role: 'user',
            parts: [{ text: latestUserMessage }],
          });
          latestUserMessage = '';
        }
        history.push({
          role: 'model',
          parts: [{ text: msg.content }],
        });
      }
    }

    // Start chat with history
    const chat = model.startChat({
      history: history.length > 0 ? history : undefined,
    });

    // Send the latest user message and stream response
    const result = await chat.sendMessageStream(latestUserMessage || messages[messages.length - 1]?.content || '');

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        yield text;
      }
    }
  }

  /**
   * Create a completion with function calling support (non-streaming)
   * Returns both text response and any function calls
   */
  async createCompletionWithTools(
    options: GeminiCompletionOptions
  ): Promise<FunctionCallResult> {
    const { messages, systemPrompt, temperature = 0.7, maxTokens = 2000, tools } = options;

    const model = this.client.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
        topP: 0.95,
        topK: 40,
      },
      safetySettings: SAFETY_SETTINGS,
      systemInstruction: systemPrompt,
      tools: tools ? [{ functionDeclarations: tools }] : undefined,
    });

    // Convert messages to Gemini format (history + latest message)
    const history: GeminiMessage[] = [];
    let latestUserMessage = '';

    for (const msg of messages) {
      if (msg.role === 'system') continue;

      if (msg.role === 'user') {
        latestUserMessage = msg.content;
      } else if (msg.role === 'assistant') {
        if (latestUserMessage) {
          history.push({
            role: 'user',
            parts: [{ text: latestUserMessage }],
          });
          latestUserMessage = '';
        }
        history.push({
          role: 'model',
          parts: [{ text: msg.content }],
        });
      }
    }

    // Start chat with history
    const chat = model.startChat({
      history: history.length > 0 ? history : undefined,
    });

    // Send message and get response
    const result = await chat.sendMessage(latestUserMessage || messages[messages.length - 1]?.content || '');
    const response = result.response;

    // Extract function calls and text from response
    const functionCalls: FunctionCall[] = [];
    let text = '';

    for (const candidate of response.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if ('functionCall' in part && part.functionCall) {
          functionCalls.push(part.functionCall);
        }
        if ('text' in part && part.text) {
          text += part.text;
        }
      }
    }

    return { functionCalls, text };
  }

  /**
   * Continue chat after function call results
   */
  async continueWithFunctionResults(
    options: GeminiCompletionOptions,
    functionResults: Array<{ name: string; response: unknown }>
  ): Promise<string> {
    const { messages, systemPrompt, temperature = 0.7, maxTokens = 2000, tools } = options;

    const model = this.client.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
        topP: 0.95,
        topK: 40,
      },
      safetySettings: SAFETY_SETTINGS,
      systemInstruction: systemPrompt,
      tools: tools ? [{ functionDeclarations: tools }] : undefined,
    });

    // Build history including the function call exchange
    const history: GeminiMessage[] = [];
    let latestUserMessage = '';

    for (const msg of messages) {
      if (msg.role === 'system') continue;

      if (msg.role === 'user') {
        latestUserMessage = msg.content;
      } else if (msg.role === 'assistant') {
        if (latestUserMessage) {
          history.push({
            role: 'user',
            parts: [{ text: latestUserMessage }],
          });
          latestUserMessage = '';
        }
        history.push({
          role: 'model',
          parts: [{ text: msg.content }],
        });
      }
    }

    // Add the user message that triggered function calls
    if (latestUserMessage) {
      history.push({
        role: 'user',
        parts: [{ text: latestUserMessage }],
      });
    }

    // Start chat with history
    const chat = model.startChat({
      history: history.length > 0 ? history : undefined,
    });

    // Send function results - use type assertion as SDK expects this structure
    const functionResponseParts = functionResults.map((fr) => ({
      functionResponse: {
        name: fr.name,
        response: fr.response as object,
      },
    })) as Part[];

    const result = await chat.sendMessage(functionResponseParts);
    return result.response.text();
  }

  /**
   * Create a non-streaming completion (without function calling)
   */
  async createCompletion(options: GeminiCompletionOptions): Promise<string> {
    let fullText = '';
    for await (const chunk of this.createStreamingCompletion(options)) {
      fullText += chunk;
    }
    return fullText;
  }
}

// Singleton instance
let geminiClient: GeminiClient | null = null;

export function getGeminiClient(): GeminiClient {
  if (!geminiClient) {
    geminiClient = new GeminiClient();
  }
  return geminiClient;
}
