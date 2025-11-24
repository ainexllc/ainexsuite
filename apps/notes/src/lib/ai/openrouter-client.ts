import { serverEnv } from "@/env";

export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
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
  private baseUrl = "https://openrouter.ai/api/v1";
  // Default to Gemini Flash 1.5 for speed/cost
  private defaultModel = "google/gemini-flash-1.5";

  constructor(apiKey?: string) {
    this.apiKey = apiKey || serverEnv.OPENROUTER_API_KEY || "";
    if (!this.apiKey) {
       console.warn("OPENROUTER_API_KEY is not configured.");
    }
  }

  async createCompletion(options: OpenRouterCompletionOptions): Promise<OpenRouterResponse> {
    if (!this.apiKey) {
        throw new Error("OpenRouter API key is missing");
    }

    const {
      messages,
      model = this.defaultModel,
      temperature = 0.7,
      maxTokens = 1000,
      topP = 1,
    } = options;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        "HTTP-Referer": "https://ainexsuite.com", // Required by OpenRouter
        "X-Title": "AiNexNotes", // Optional
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        top_p: topP,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
    }

    return response.json();
  }

  async ask(prompt: string, systemPrompt?: string, model?: string): Promise<string> {
    const messages: OpenRouterMessage[] = [];

    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }

    messages.push({ role: "user", content: prompt });

    const response = await this.createCompletion({ messages, model });
    return response.choices[0]?.message?.content || "";
  }
}

let openRouterClient: OpenRouterClient | null = null;

export function getOpenRouterClient(): OpenRouterClient {
  if (!openRouterClient) {
    openRouterClient = new OpenRouterClient();
  }
  return openRouterClient;
}
