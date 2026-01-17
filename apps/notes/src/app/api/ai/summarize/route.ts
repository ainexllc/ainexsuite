/**
 * AI Summarization API Route
 * Summarizes text content using Grok
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { summarizeText } from "@/lib/ai";
import { getUserFromSession } from "@/lib/auth/server-verify";

// Request validation schema with max length
const MAX_TEXT_LENGTH = 100000; // 100KB limit for summarization

const summarizeRequestSchema = z.object({
  text: z.string().min(1, "Text is required").max(MAX_TEXT_LENGTH, `Text exceeds maximum length of ${MAX_TEXT_LENGTH} characters`),
  maxLength: z.number().positive().optional(),
  style: z.enum(["brief", "detailed", "bullet-points"]).optional(),
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
    const parseResult = summarizeRequestSchema.safeParse(await request.json());
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const { text, maxLength, style } = parseResult.data;

    const summary = await summarizeText({ text, maxLength, style });

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("AI Summarize Error:", error);
    return NextResponse.json(
      { error: "Failed to summarize text. Please try again." },
      { status: 500 }
    );
  }
}
