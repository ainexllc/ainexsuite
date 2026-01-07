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
      improve: `Improve the following text by making it clearer, more engaging, and better structured. Maintain a ${tone || "professional"} tone.`,
      simplify: `Simplify the following text to make it easier to understand. Use plain language and maintain a ${tone || "professional"} tone.`,
      expand: `Expand the following text with more details, examples, and explanations. Maintain a ${tone || "professional"} tone.`,
      rewrite: `Rewrite the following text in a different way while keeping the same meaning. Use a ${tone || "casual"} tone.`,
      grammar: `Fix all spelling, grammar, and punctuation errors in the following text. Keep the original meaning, tone, and style intact. Only correct errors, do not rewrite or rephrase.`,
    };

    const prompt = `${taskInstructions[task]}

Text to enhance:
${text}

Return ONLY the enhanced text, no explanations or formatting.`;

    const completion = await client.createCompletion({
      messages: [
        { role: "system", content: "You are a professional content editor and writer. Return only the enhanced text without any explanations, markdown formatting, or quotes." },
        { role: "user", content: prompt }
      ],
      model: "grok-4-1-fast",
      temperature: 0.7,
    });

    const enhanced = completion.choices[0]?.message?.content || text;

    return NextResponse.json({ enhanced: enhanced.trim() });
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
