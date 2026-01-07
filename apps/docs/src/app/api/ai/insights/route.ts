import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const SYSTEM_PROMPT = `You are a helpful AI assistant that analyzes docs and extracts structured insights. You only speak JSON.

Return ONLY valid JSON with this exact structure (no markdown, no code blocks, just raw JSON):
{
  "summary": "A 1-sentence summary of the doc",
  "actionItems": ["Action item 1", "Action item 2"],
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4", "Tag5"]
}

Guidelines:
- summary: Brief and concise.
- actionItems: Extract up to 3 potential tasks or actionable steps. If none, return an empty array.
- tags: Suggest 3-5 relevant 1-word tags for categorization.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content } = body as { title: string; content: string };

    if (!content && !title) {
      return NextResponse.json(
        { error: "Content or title is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI API key is missing (GROK_API_KEY)" },
        { status: 500 }
      );
    }

    const userMessage = `Analyze the following doc content and provide insights.

Title: ${title || "Untitled"}
Content: ${content || "(No content)"}`;

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
      const errorText = await response.text();
      console.error("xAI API Error:", errorText);
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
      console.error("Failed to parse AI response:", aiResponse);
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
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    );
  }
}
