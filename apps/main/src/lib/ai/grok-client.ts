import { serverEnv } from "@/env";

export interface GrokMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GrokCompletionOptions {
  messages: GrokMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

export interface GrokResponse {
  choices: Array<{
    message: GrokMessage;
    finish_reason: string;
  }>;
}

export class GrokClient {
  private apiKey: string;
  private baseUrl = "https://api.x.ai/v1";
  private defaultModel = "grok-2-latest";

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GROK_API_KEY || serverEnv.GROK_API_KEY || "";
    if (!this.apiKey) {
      console.warn("GROK_API_KEY is not configured.");
    }
  }

  async createCompletion(options: GrokCompletionOptions): Promise<GrokResponse> {
    const {
      messages,
      temperature = 0.7,
      maxTokens = 1000,
      topP = 1,
    } = options;

    const model = this.defaultModel;

    if (!this.apiKey) {
      console.error("AI Client: Missing GROK_API_KEY");
      throw new Error("GROK_API_KEY is missing");
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        top_p: topP,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI Client Error (${response.status}):`, errorText);
      throw new Error(`AI API error (${response.status}): ${errorText}`);
    }

    return response.json();
  }

  async ask(prompt: string, systemPrompt?: string): Promise<string> {
    const messages: GrokMessage[] = [];

    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }

    messages.push({ role: "user", content: prompt });

    const response = await this.createCompletion({ messages });
    return response.choices[0]?.message?.content || "";
  }
}

let grokClient: GrokClient | null = null;

export function getGrokClient(): GrokClient {
  if (!grokClient) {
    grokClient = new GrokClient();
  }
  return grokClient;
}
