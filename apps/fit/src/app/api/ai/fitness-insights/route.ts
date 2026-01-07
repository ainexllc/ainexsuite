import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

interface WorkoutData {
  name: string;
  type: string;
  date: string;
  duration?: number;
  exercises?: number;
}

interface NutritionData {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const SYSTEM_PROMPT = `You are a personal fitness coach and nutritionist. Analyze the provided workout and nutrition data and return insights in JSON format.

Return ONLY valid JSON with this exact structure (no markdown, no code blocks, just raw JSON):
{
  "weeklyFocus": "One sentence about the main fitness focus this week",
  "workoutTrend": "Brief observation about workout patterns (frequency, types, progress)",
  "nutritionTrend": "Brief observation about nutrition patterns (macros balance, calorie trends)",
  "suggestions": ["Actionable tip 1", "Actionable tip 2", "Actionable tip 3"],
  "personalRecord": "Note any achievements or improvements worth celebrating",
  "nextSteps": "One specific recommendation for the coming week"
}

Guidelines:
- weeklyFocus: Identify the main theme of recent activity (e.g., "Building upper body strength")
- workoutTrend: Comment on consistency, variety, or any patterns noticed
- nutritionTrend: Evaluate macro balance and eating patterns
- suggestions: 3 specific, actionable improvements based on the data
- personalRecord: Highlight any wins, even small ones
- nextSteps: One clear priority for next week

Be encouraging but honest. Focus on progress and actionable advice.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workouts, nutrition } = body as {
      workouts: WorkoutData[];
      nutrition?: NutritionData[];
    };

    if (!workouts || !Array.isArray(workouts) || workouts.length === 0) {
      return NextResponse.json(
        { error: "No workout data provided to analyze" },
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

    // Format workouts for the AI
    const workoutsText = workouts
      .map(
        (w, i) =>
          `Workout ${i + 1} (${w.date}): ${w.name} - ${w.type}${w.duration ? `, ${w.duration}min` : ""}${w.exercises ? `, ${w.exercises} exercises` : ""}`
      )
      .join("\n");

    // Format nutrition if available
    const nutritionText = nutrition?.length
      ? nutrition
          .map(
            (n) =>
              `${n.date}: ${n.calories}cal, P:${n.protein}g, C:${n.carbs}g, F:${n.fat}g`
          )
          .join("\n")
      : "No nutrition data available";

    const userMessage = `Please analyze this fitness data and provide insights:

RECENT WORKOUTS (${workouts.length} total):
${workoutsText}

RECENT NUTRITION:
${nutritionText}`;

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
        temperature: 0.5,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("xAI API Error:", errorText);
      return NextResponse.json(
        { error: "Failed to generate fitness insights" },
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
        weeklyFocus:
          "Keep up your fitness journey - every workout counts!",
        workoutTrend:
          "You're building a consistent routine. Keep it up!",
        nutritionTrend:
          "Track your meals to see detailed nutrition insights.",
        suggestions: [
          "Try adding variety to your workouts",
          "Stay hydrated throughout the day",
          "Get enough sleep for recovery",
        ],
        personalRecord: "You're showing up and putting in the work!",
        nextSteps: "Focus on consistency over the next week.",
      };
    }

    // Validate and ensure proper structure
    return NextResponse.json({
      weeklyFocus: insights.weeklyFocus || "Stay consistent with your routine",
      workoutTrend: insights.workoutTrend || "",
      nutritionTrend: insights.nutritionTrend || "",
      suggestions: Array.isArray(insights.suggestions)
        ? insights.suggestions.slice(0, 5)
        : [],
      personalRecord: insights.personalRecord || "",
      nextSteps: insights.nextSteps || "Keep pushing forward!",
    });
  } catch (error) {
    console.error("Fitness Insights Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    );
  }
}
