import { NextRequest, NextResponse } from "next/server";
import { getGrokClient } from "@/lib/ai/grok-client";

interface InsightDataItem {
  app: string;
  type: string;
  title: string;
  subtitle?: string;
  priority: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { insights } = body as { insights: InsightDataItem[] };

    if (!insights || !Array.isArray(insights) || insights.length === 0) {
      return NextResponse.json(
        { error: "No data provided to analyze" },
        { status: 400 }
      );
    }

    const client = getGrokClient();

    // Group insights by app for context
    const groupedInsights = insights.reduce((acc, item) => {
      if (!acc[item.app]) acc[item.app] = [];
      acc[item.app].push(item);
      return acc;
    }, {} as Record<string, InsightDataItem[]>);

    // Build context from all apps
    const insightsContext = Object.entries(groupedInsights)
      .map(([app, items]) => {
        const itemsStr = items
          .map(i => `- [${i.type}] ${i.title}${i.subtitle ? `: ${i.subtitle}` : ''} (${i.priority} priority)`)
          .join("\n");
        return `${app.toUpperCase()}:\n${itemsStr}`;
      })
      .join("\n\n");

    const prompt = `Analyze the user's activity across their personal productivity space and provide a helpful daily summary.

Current Activity Data:
${insightsContext}

Based on this data, provide a JSON response with:
{
  "dailySummary": "A friendly 2-3 sentence summary of the user's current priorities and progress across all apps.",
  "topPriorities": ["Priority 1", "Priority 2", "Priority 3"],
  "suggestions": ["Actionable suggestion 1", "Actionable suggestion 2"],
  "wellnessNote": "A brief encouraging note about work-life balance based on their activity patterns."
}

Guidelines:
- "dailySummary": Synthesize activity patterns into an insightful overview. Be specific about what they're working on.
- "topPriorities": Extract the 3 most important/urgent items they should focus on today.
- "suggestions": Provide 2 helpful suggestions based on patterns (e.g., "Consider journaling today" if no recent entries).
- "wellnessNote": A brief, warm reminder about self-care or balance.

Return ONLY valid JSON, no markdown formatting.`;

    const completion = await client.createCompletion({
      messages: [
        {
          role: "system",
          content: "You are a thoughtful personal productivity assistant. You analyze activity patterns and provide helpful, encouraging insights. You speak only valid JSON. Do not include markdown formatting."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.4,
    });

    const responseContent = completion.choices[0]?.message?.content || "{}";

    // Robust JSON extraction
    let jsonStr = responseContent;
    const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    let data;
    try {
      data = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response:", responseContent);
      return NextResponse.json({
        dailySummary: "Your space is active with recent updates across your apps.",
        topPriorities: [],
        suggestions: ["Keep up the great work!"],
        wellnessNote: "Remember to take breaks and stay hydrated."
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Space Insights Error:", error);
    if (error instanceof Error && (error.message.includes("API_KEY") || error.message.includes("XAI"))) {
      return NextResponse.json(
        { error: "AI configuration missing (API Key)." },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    );
  }
}
