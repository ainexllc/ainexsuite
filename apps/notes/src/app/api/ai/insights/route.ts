import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUserFromSession } from "@/lib/auth/server-verify";

export const maxDuration = 60;

// Request validation schema with max length
const MAX_CONTENT_LENGTH = 50000; // 50KB limit

const insightsRequestSchema = z.object({
  title: z.string().max(500).optional(),
  content: z.string().max(MAX_CONTENT_LENGTH).optional(),
}).refine(
  (data) => data.title || data.content,
  { message: "Either title or content is required" }
);

const SYSTEM_PROMPT = `You are a helpful AI assistant that analyzes notes and extracts structured insights. You only speak JSON.

Return ONLY valid JSON with this exact structure (no markdown, no code blocks, just raw JSON):
{
  "summary": "A 1-sentence summary of the note",
  "actionItems": ["Action item 1", "Action item 2"],
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4", "Tag5"]
}

Guidelines:
- summary: Brief and concise.
- actionItems: Extract up to 3 potential tasks or actionable steps. If none, return an empty array.
- tags: Suggest 3-5 relevant 1-word tags for categorization.`;

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
    const parseResult = insightsRequestSchema.safeParse(await request.json());
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const { title, content } = parseResult.data;

    const apiKey = process.env.GROK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI service is not configured" },
        { status: 500 }
      );
    }

    // Sanitize user input for prompt (basic escaping)
    const sanitizedTitle = (title || "Untitled").replace(/[<>]/g, '');
    const sanitizedContent = (content || "(No content)").replace(/[<>]/g, '');

    const userMessage = `Analyze the following note content and provide insights.

Title: ${sanitizedTitle}
Content: ${sanitizedContent}`;

    // Call xAI Grok directly
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4-1-fast-non-reasoning",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      console.error("xAI API Error:", await response.text());
      return NextResponse.json(
        { error: "Failed to generate insights" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "";

    // Parse the JSON response from AI
    let insights;
    try {
      let jsonStr = aiResponse;

      // Remove markdown code blocks if present
      const codeBlockMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1].trim();
      } else {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonStr = jsonMatch[0];
        }
      }

      insights = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response");
      return NextResponse.json(
        { error: "Failed to generate valid insights" },
        { status: 500 }
      );
    }

    // Validate and ensure proper structure
    return NextResponse.json({
      summary: insights.summary || "No summary available",
      actionItems: Array.isArray(insights.actionItems) ? insights.actionItems.slice(0, 3) : [],
      tags: Array.isArray(insights.tags) ? insights.tags.slice(0, 5) : [],
    });
  } catch (error) {
    console.error("AI Insights Error:", error);
    return NextResponse.json(
      { error: "Failed to generate insights. Please try again." },
      { status: 500 }
    );
  }
}
