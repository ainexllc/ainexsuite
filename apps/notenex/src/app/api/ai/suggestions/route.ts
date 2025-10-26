/**
 * AI Suggestions API Route
 * Generates suggestions based on context using Grok
 */

import { NextRequest, NextResponse } from "next/server";
import { generateSuggestions } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { context, count = 5 } = body as {
      context: string;
      count?: number;
    };

    if (!context) {
      return NextResponse.json(
        { error: "Context is required" },
        { status: 400 }
      );
    }

    const suggestions = await generateSuggestions(context, count);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("AI Suggestions API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "An error occurred",
      },
      { status: 500 }
    );
  }
}
