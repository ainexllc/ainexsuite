/**
 * AI Content Enhancement API Route
 * Enhances or modifies text content using Grok
 */

import { NextRequest, NextResponse } from "next/server";
import { enhanceContent } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, task, tone } = body as {
      text: string;
      task: "improve" | "simplify" | "expand" | "rewrite";
      tone?: "professional" | "casual" | "friendly" | "formal";
    };

    if (!text || !task) {
      return NextResponse.json(
        { error: "Text and task are required" },
        { status: 400 }
      );
    }

    const enhanced = await enhanceContent({ text, task, tone });

    return NextResponse.json({ enhanced });
  } catch (error) {
    console.error("AI Enhancement API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "An error occurred",
      },
      { status: 500 }
    );
  }
}
