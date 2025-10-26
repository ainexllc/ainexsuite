/**
 * Grok AI Client
 * Provides integration with xAI's Grok API using the grok-beta model
 */

import { serverEnv } from "@/env";

export interface GrokMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GrokCompletionOptions {
  messages: GrokMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface GrokCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: GrokMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class GrokClient {
  private apiKey: string;
  private baseUrl = "https://api.x.ai/v1";
  private model = "grok-beta";

  constructor(apiKey?: string) {
    this.apiKey = apiKey || serverEnv.XAI_API_KEY || "";
    if (!this.apiKey) {
      throw new Error("XAI_API_KEY is not configured. Please set it in your environment variables.");
    }
  }

  /**
   * Create a chat completion with Grok
   */
  async createCompletion(options: GrokCompletionOptions): Promise<GrokCompletionResponse> {
    const {
      messages,
      temperature = 0.7,
      maxTokens = 1000,
      stream = false,
      topP = 1,
      frequencyPenalty = 0,
      presencePenalty = 0,
    } = options;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream,
        top_p: topP,
        frequency_penalty: frequencyPenalty,
        presence_penalty: presencePenalty,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Grok API error (${response.status}): ${errorText}`);
    }

    return response.json();
  }

  /**
   * Create a streaming chat completion with Grok
   */
  async *createStreamingCompletion(
    options: GrokCompletionOptions
  ): AsyncGenerator<string, void, unknown> {
    const {
      messages,
      temperature = 0.7,
      maxTokens = 1000,
      topP = 1,
      frequencyPenalty = 0,
      presencePenalty = 0,
    } = options;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: true,
        top_p: topP,
        frequency_penalty: frequencyPenalty,
        presence_penalty: presencePenalty,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Grok API error (${response.status}): ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Failed to get response reader");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim() === "" || line.trim() === "data: [DONE]") continue;
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              const content = data.choices?.[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch (e) {
              console.error("Error parsing streaming response:", e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Simple helper for single-message completions
   */
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

// Export a singleton instance
let grokClient: GrokClient | null = null;

export function getGrokClient(): GrokClient {
  if (!grokClient) {
    grokClient = new GrokClient();
  }
  return grokClient;
}
