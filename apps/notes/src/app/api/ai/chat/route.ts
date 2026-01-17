/**
 * AI Chat API Route
 * Handles AI chat for the Notes app using Gemini with function calling
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getGeminiClient } from "@/lib/ai/gemini-client";
import { NOTE_TOOLS } from "@/lib/ai/note-tools";
import { getUserFromSession } from "@/lib/auth/server-verify";

// Request validation schema
const chatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.string(),
    content: z.string(),
  })).min(1, "At least one message is required"),
  systemPrompt: z.string().optional(),
  appName: z.string().optional(),
  context: z.record(z.unknown()).optional(),
  enableTools: z.boolean().default(true),
  functionResults: z.array(z.object({
    name: z.string(),
    response: z.unknown(),
  })).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Authentication check (session cookie)
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Validate request body
    const parseResult = chatRequestSchema.safeParse(await request.json());
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const { messages, systemPrompt, enableTools, functionResults } = parseResult.data;

    const client = getGeminiClient();

    // If function results are provided, continue the conversation
    if (functionResults && functionResults.length > 0) {
      // Filter to ensure all results have responses
      const validResults = functionResults.filter(
        (r): r is { name: string; response: unknown } => r.response !== undefined
      );
      const text = await client.continueWithFunctionResults(
        {
          messages,
          systemPrompt,
          temperature: 0.7,
          maxTokens: 2000,
          tools: enableTools ? NOTE_TOOLS : undefined,
        },
        validResults
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
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error('[AI Chat] Error:', error);
    return NextResponse.json(
      { error: "Failed to process chat request. Please try again." },
      { status: 500 }
    );
  }
}
