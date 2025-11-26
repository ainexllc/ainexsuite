import { NextRequest, NextResponse } from "next/server";
import { getOpenRouterClient } from "@/lib/ai/openrouter-client";

export const maxDuration = 60;

const SYSTEM_PROMPT = `You are a thoughtful journaling assistant. Analyze the provided journal entries and return insights in JSON format.

Return ONLY valid JSON with this exact structure (no markdown, no code blocks, just raw JSON):
{
  "weeklyVibe": "A 1-2 sentence summary of the overall emotional tone and energy from these entries",
  "recurringThemes": ["theme1", "theme2", "theme3"],
  "reflectionPrompts": ["prompt1", "prompt2", "prompt3"]
}

Guidelines:
- weeklyVibe: Capture the dominant emotional atmosphere. Be warm and supportive.
- recurringThemes: 3-5 topics, feelings, or patterns that appear across entries (e.g., "work stress", "gratitude", "relationships")
- reflectionPrompts: 3 thoughtful questions to encourage deeper self-reflection based on the entries

Keep responses concise and meaningful. Focus on patterns rather than individual entries.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entries } = body as { entries: { title: string; content: string; date: string; mood?: string }[] };

    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json(
        { error: "No recent entries provided to analyze" },
        { status: 400 }
      );
    }

    // Format entries for the AI
    const entriesText = entries.map((e, i) =>
      `Entry ${i + 1} (${e.date})${e.mood ? ` [Mood: ${e.mood}]` : ''}:\nTitle: ${e.title}\n${e.content}`
    ).join('\n\n---\n\n');

    const userMessage = `Please analyze these ${entries.length} recent journal entries and provide insights:\n\n${entriesText}`;

    // Use the existing OpenRouter client (supports xAI/Grok direct)
    const client = getOpenRouterClient();
    const aiResponse = await client.ask(userMessage, SYSTEM_PROMPT, "grok-3-fast");

    // Parse the JSON response from AI
    let insights;
    try {
      // Try to extract JSON from the response (handle markdown code blocks)
      let jsonStr = aiResponse;

      // Remove markdown code blocks if present
      const codeBlockMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1].trim();
      } else {
        // Try to find raw JSON object
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonStr = jsonMatch[0];
        }
      }

      insights = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiResponse);
      // Return fallback insights
      insights = {
        weeklyVibe: "Your recent entries show a thoughtful approach to self-reflection. Keep journaling!",
        recurringThemes: ["self-reflection", "daily life", "personal growth"],
        reflectionPrompts: [
          "What moment from this week brought you the most joy?",
          "What's one thing you'd like to do differently next week?",
          "Who or what are you grateful for today?"
        ]
      };
    }

    // Validate and ensure proper structure
    return NextResponse.json({
      weeklyVibe: insights.weeklyVibe || "Keep journaling to discover your patterns!",
      recurringThemes: Array.isArray(insights.recurringThemes) ? insights.recurringThemes.slice(0, 5) : [],
      reflectionPrompts: Array.isArray(insights.reflectionPrompts) ? insights.reflectionPrompts.slice(0, 3) : []
    });

  } catch (error) {
    console.error("Journal Insights Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    );
  }
}
