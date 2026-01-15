/**
 * AI Chat API Route
 * Handles AI chat for the Notes app using Gemini with function calling
 */

import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/ai/gemini-client";
import { NOTE_TOOLS } from "@/lib/ai/note-tools";

interface ChatRequestBody {
  messages: Array<{ role: string; content: string }>;
  systemPrompt?: string;
  appName?: string;
  context?: Record<string, unknown>;
  enableTools?: boolean;
  functionResults?: Array<{ name: string; response: unknown }>;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChatRequestBody;
    const { messages, systemPrompt, enableTools = true, functionResults } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const client = getGeminiClient();

    // If function results are provided, continue the conversation
    if (functionResults && functionResults.length > 0) {
      const text = await client.continueWithFunctionResults(
        {
          messages,
          systemPrompt,
          temperature: 0.7,
          maxTokens: 2000,
          tools: enableTools ? NOTE_TOOLS : undefined,
        },
        functionResults
      );

      return NextResponse.json({
        type: 'text',
        content: text,
      });
    }

    // If tools are enabled, use function calling (non-streaming)
    if (enableTools) {
      const result = await client.createCompletionWithTools({
        messages,
        systemPrompt,
        temperature: 0.7,
        maxTokens: 2000,
        tools: NOTE_TOOLS,
      });

      // If there are function calls, return them for client to execute
      if (result.functionCalls.length > 0) {
        return NextResponse.json({
          type: 'function_calls',
          functionCalls: result.functionCalls.map((fc) => ({
            name: fc.name,
            args: fc.args,
          })),
          text: result.text, // May have partial text too
        });
      }

      // No function calls, just return text
      return NextResponse.json({
        type: 'text',
        content: result.text,
      });
    }

    // Streaming response (no function calling)
    const encoder = new TextEncoder();
    const responseStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of client.createStreamingCompletion({
            messages,
            systemPrompt,
            temperature: 0.7,
            maxTokens: 2000,
          })) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(responseStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error('[AI Chat] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "An error occurred",
      },
      { status: 500 }
    );
  }
}
