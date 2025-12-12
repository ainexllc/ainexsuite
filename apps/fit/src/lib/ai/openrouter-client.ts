import { serverEnv } from '@/env';

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterCompletionOptions {
  messages: OpenRouterMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

export interface OpenRouterResponse {
  choices: Array<{
    message: OpenRouterMessage;
    finish_reason: string;
  }>;
}

export class OpenRouterClient {
  private apiKey: string;
  private baseUrl = 'https://api.x.ai/v1';
  // Use Grok 4.1 Fast for all AI tasks
  private defaultModel = 'grok-4-1-fast';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GROK_API_KEY || serverEnv.XAI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('GROK_API_KEY is not configured.');
    }
  }

  async createCompletion(options: OpenRouterCompletionOptions): Promise<OpenRouterResponse> {
    const {
      messages,
      temperature = 0.7,
      maxTokens = 1000,
      topP = 1,
    } = options;

    // Always use xAI/Grok API with grok-4-1-fast-non-reasoning
    const model = this.defaultModel;

    if (!this.apiKey) {
      console.error('AI Client: Missing GROK_API_KEY');
      throw new Error('GROK_API_KEY is missing');
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        top_p: topP,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI Client Error (${response.status}):`, errorText);
      throw new Error(`AI API error (${response.status}): ${errorText}`);
    }

    return response.json();
  }
}

let openRouterClient: OpenRouterClient | null = null;

export function getOpenRouterClient(): OpenRouterClient {
  if (!openRouterClient) {
    openRouterClient = new OpenRouterClient();
  }
  return openRouterClient;
}
