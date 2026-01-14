/**
 * AI Content Enhancement API Route
 * Enhances or modifies text content using OpenRouter (same as workspace insights)
 */

import { NextRequest, NextResponse } from "next/server";
import { getOpenRouterClient } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, task, tone } = body as {
      text: string;
      task: "improve" | "simplify" | "expand" | "rewrite" | "grammar";
      tone?: "professional" | "casual" | "friendly" | "formal";
    };

    if (!text || !task) {
      return NextResponse.json(
        { error: "Text and task are required" },
        { status: 400 }
      );
    }

    const client = getOpenRouterClient();

    const taskInstructions = {
      improve: `Improve the following text by making it clearer, more engaging, and better structured. Break into multiple paragraphs where appropriate for better readability. Maintain a ${tone || "professional"} tone.`,
      simplify: `Simplify the following text to make it easier to understand. Use plain language and break into clear paragraphs where appropriate. Maintain a ${tone || "professional"} tone.`,
      expand: `Expand the following text with more details, examples, and explanations. Break the content into well-organized paragraphs for better readability. Maintain a ${tone || "professional"} tone.`,
      rewrite: `Rewrite the following text in a different way while keeping the same meaning. Use paragraphs to organize the content clearly. Use a ${tone || "casual"} tone.`,
      grammar: `Fix all spelling, grammar, and punctuation errors in the following text. Keep the original meaning, tone, and style intact. Only correct errors, do not rewrite or rephrase.`,
    };

    const prompt = `${taskInstructions[task]}

Text to enhance:
${text}

Return ONLY the enhanced text as plain text. Use paragraphs (blank lines between them) to organize content. Do not use markdown, no bullet points with asterisks or dashes, no headers with #. Just clean prose text with proper paragraph breaks.`;

    const completion = await client.createCompletion({
      messages: [
        { role: "system", content: "You are a professional content editor and writer. Return only the enhanced text as clean prose. Use multiple paragraphs (separated by blank lines) to organize content for readability. Never use markdown formatting (no **, no #, no -, no *). No explanations or quotes. Just the improved text." },
        { role: "user", content: prompt }
      ],
      // Let client use its default model (grok-4-1-fast-non-reasoning)
      temperature: 0.7,
    });

    const rawEnhanced = completion.choices[0]?.message?.content || text;

    // Convert plain text to HTML for TipTap rich text editor
    // Split by double newlines for paragraphs, preserve single newlines as <br>
    // Add empty paragraph between for extra spacing
    const enhanced = rawEnhanced
      .trim()
      .split(/\n\n+/)
      .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
      .join('<p></p>');

    return NextResponse.json({ enhanced });
  } catch (error) {
    console.error("AI Enhance Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "An error occurred",
      },
      { status: 500 }
    );
  }
}
