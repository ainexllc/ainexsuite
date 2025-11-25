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
    // Fallback to process.env if serverEnv doesn't have it explicitly typed
    this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || "";
    if (!this.apiKey && !serverEnv.XAI_API_KEY) {
       console.warn("AI API keys are not configured.");
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
      "Content-Type": "application/json",
      "HTTP-Referer": "https://ainexsuite.com", // Required by OpenRouter
      "X-Title": "Journey", // Optional
    };

    // xAI Direct Override
    // If the model requested is a Grok model AND we have an xAI key, go direct.
    if ((model.includes("grok") || model.includes("x-ai")) && serverEnv.XAI_API_KEY) {
        endpoint = "https://api.x.ai/v1/chat/completions";
        token = serverEnv.XAI_API_KEY;
        
        // Map OpenRouter IDs to xAI Direct IDs
        // Note: grok-beta was deprecated on 2025-09-15
        if (model === "grok-4.1-fast" || model === "x-ai/grok-4.1-fast") {
            model = "grok-4.1-fast"; // Fast non-reasoning model
        } else if (model === "grok-3" || model === "x-ai/grok-3") {
            model = "grok-3";
        } else if (model === "grok-beta" || model === "x-ai/grok-beta") {
            model = "grok-3"; // grok-beta deprecated, use grok-3
        } else if (model.startsWith("x-ai/")) {
            // Fallback: strip prefix
            model = model.replace("x-ai/", "");
        }
        
        headers = {
            "Content-Type": "application/json",
        };
    }

    if (!token) {
        if (process.env.NODE_ENV === "development") {
            console.warn("AI Client: Missing API Key in development. Returning mock response.");
            return {
                choices: [{
                    message: {
                        role: "assistant",
                        content: JSON.stringify({
                            weeklyVibe: "Simulated Vibe (Dev Mode)",
                            recurringThemes: ["Simulated Theme 1", "Simulated Theme 2"],
                            reflectionPrompts: ["Simulated Prompt 1?", "Simulated Prompt 2?", "Simulated Prompt 3?"]
                        })
                    },
                    finish_reason: "stop"
                }]
            };
        }
        console.error("AI Client: Missing API Key");
        throw new Error("AI API key is missing");
    }

    headers["Authorization"] = `Bearer ${token}`;

    // console.log(`AI Client Request: ${endpoint} [Model: ${model}]`);

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
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
