import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const SYSTEM_PROMPT = `You are a thoughtful journaling assistant. Analyze the provided journal entries and return insights in JSON format.

Return ONLY valid JSON with this exact structure (no markdown, no code blocks, just raw JSON):
{
  "moodSummary": "A brief 1-sentence summary of the overall mood across entries (e.g., 'Your entries show a mix of optimism and contemplation')",
  "weeklyHighlight": "One standout positive moment or achievement from the entries worth celebrating",
  "emotionalTrend": "A brief observation about emotional patterns (e.g., 'Energy levels seem higher on weekends')",
  "commonThemes": ["theme1", "theme2", "theme3"],
  "reflectionPrompt": "A single thoughtful question to encourage deeper self-reflection"
}

Guidelines:
- moodSummary: Capture the dominant emotional atmosphere in one sentence. Be warm and supportive.
- weeklyHighlight: Find something positive to highlight, even in challenging times.
- emotionalTrend: Note any patterns in mood or energy across the entries.
- commonThemes: 3-5 topics, feelings, or patterns that appear across entries.
- reflectionPrompt: One meaningful question based on the content.

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

    const apiKey = process.env.GROK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI API key is missing (GROK_API_KEY)" },
        { status: 500 }
      );
    }

    // Format entries for the AI
    const entriesText = entries.map((e, i) =>
      `Entry ${i + 1} (${e.date})${e.mood ? ` [Mood: ${e.mood}]` : ''}:\nTitle: ${e.title}\n${e.content}`
    ).join('\n\n---\n\n');

    const userMessage = `Please analyze these ${entries.length} recent journal entries and provide insights:\n\n${entriesText}`;

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
      // Return fallback insights
      insights = {
        moodSummary: "Your recent entries show a thoughtful approach to self-reflection.",
        weeklyHighlight: "You're maintaining a consistent journaling practice - that's worth celebrating!",
        emotionalTrend: "Keep journaling to discover your emotional patterns over time.",
        commonThemes: ["self-reflection", "daily life", "personal growth"],
        reflectionPrompt: "What moment from this week brought you the most joy?"
      };
    }

    // Validate and ensure proper structure
    return NextResponse.json({
      moodSummary: insights.moodSummary || "Keep journaling to discover your patterns!",
      weeklyHighlight: insights.weeklyHighlight || "You're building a great journaling habit!",
      emotionalTrend: insights.emotionalTrend || "",
      commonThemes: Array.isArray(insights.commonThemes) ? insights.commonThemes.slice(0, 5) : [],
      reflectionPrompt: insights.reflectionPrompt || "What are you grateful for today?"
    });

  } catch (error) {
    console.error("Journal Insights Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    );
  }
}
