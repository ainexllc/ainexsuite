/**
 * AI Summarization API Route
 * Summarizes text content using Grok
 */

import { NextRequest, NextResponse } from "next/server";
import { summarizeText } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, maxLength, style } = body as {
      text: string;
      maxLength?: number;
      style?: "brief" | "detailed" | "bullet-points";
    };

    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    const summary = await summarizeText({ text, maxLength, style });

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("AI Summarization API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "An error occurred",
      },
      { status: 500 }
    );
  }
}
