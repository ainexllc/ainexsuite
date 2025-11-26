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
  private baseUrl = 'https://openrouter.ai/api/v1';
  private defaultModel = 'google/gemini-2.0-flash-001';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || serverEnv.OPENROUTER_API_KEY || '';
    if (!this.apiKey && !serverEnv.XAI_API_KEY) {
      console.warn('AI API keys are not configured.');
    }
  }

  async createCompletion(options: OpenRouterCompletionOptions): Promise<OpenRouterResponse> {
    let { model = this.defaultModel } = options;
    const {
      messages,
      temperature = 0.7,
      maxTokens = 1000,
      topP = 1,
    } = options;

    let endpoint = `${this.baseUrl}/chat/completions`;
    let token = this.apiKey;
    let headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://ainexsuite.com',
      'X-Title': 'AiNexFit',
    };

    // xAI Direct Override
    if ((model.includes('grok') || model.includes('x-ai')) && serverEnv.XAI_API_KEY) {
      endpoint = 'https://api.x.ai/v1/chat/completions';
      token = serverEnv.XAI_API_KEY;

      if (model.includes('grok-4') && model.includes('fast')) {
        model = 'grok-4-1-fast-non-reasoning';
      } else if (model.includes('grok-4')) {
        model = 'grok-4';
      } else if (model === 'x-ai/grok-3-fast' || model === 'grok-3-fast') {
        model = 'grok-3-fast';
      } else if (model === 'grok-3' || model === 'x-ai/grok-3') {
        model = 'grok-3';
      } else if (model === 'grok-beta' || model === 'x-ai/grok-beta') {
        model = 'grok-3';
      } else if (model.startsWith('x-ai/')) {
        model = model.replace('x-ai/', '');
      }

      headers = {
        'Content-Type': 'application/json',
      };
    } else if (model.includes('grok') || model.includes('x-ai')) {
      model = this.defaultModel;
    }

    if (!token) {
      console.error('AI Client: Missing API Key');
      throw new Error('AI API key is missing');
    }

    headers['Authorization'] = `Bearer ${token}`;

    console.log(`AI Client Request: ${endpoint} [Model: ${model}]`);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
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
