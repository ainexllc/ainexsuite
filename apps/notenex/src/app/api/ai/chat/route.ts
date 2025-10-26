/**
 * AI Chat API Route
 * Example endpoint demonstrating Grok integration
 */

import { NextRequest, NextResponse } from "next/server";
import { getGrokClient } from "@/lib/ai";
import type { GrokMessage } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, stream = false } = body as {
      messages: GrokMessage[];
      stream?: boolean;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const client = getGrokClient();

    // Handle streaming response
    if (stream) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of client.createStreamingCompletion({
              messages,
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

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // Handle regular response
    const response = await client.createCompletion({ messages });

    return NextResponse.json({
      message: response.choices[0]?.message?.content || "",
      usage: response.usage,
    });
  } catch (error) {
    console.error("AI Chat API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "An error occurred",
      },
      { status: 500 }
    );
  }
}
