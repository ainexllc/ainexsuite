import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

interface HealthMetricPayload {
  date: string;
  weight?: number | null;
  sleep?: number | null;
  water?: number | null;
  energy?: number | null;
  mood?: string | null;
  heartRate?: number | null;
  notes?: string;
}

const SYSTEM_PROMPT = `You are a supportive wellness coach AI. Analyze the provided health check-in data and return insights in JSON format.

Return ONLY valid JSON with this exact structure (no markdown, no code blocks, just raw JSON):
{
  "weeklyFocus": "A 1-2 sentence summary of the user's current health focus and overall patterns",
  "mood": "One word describing overall energy/mood trend: energized, tired, balanced, stressed, focused, relaxed, improving, or declining",
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "focusArea": "One key area to focus on based on the data",
  "healthTrends": [
    {"metric": "Sleep", "trend": "improving/stable/declining + brief note"},
    {"metric": "Hydration", "trend": "improving/stable/declining + brief note"},
    {"metric": "Energy", "trend": "improving/stable/declining + brief note"}
  ],
  "quickTip": "One actionable tip they can do today"
}

Guidelines:
- weeklyFocus: Summarize the overall health picture. Be encouraging and supportive.
- mood: Single word from the list that best describes their overall state
- recommendations: 3 actionable, specific tips based on the data (e.g., "Try to get to bed 30 minutes earlier to hit your 8-hour sleep goal")
- focusArea: Identify the most impactful area to improve based on trends
- healthTrends: Include 2-3 key metrics showing their trends
- quickTip: One simple, immediately actionable suggestion

Keep responses warm, motivating, and focused on sustainable improvements.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { metrics } = body as { metrics: HealthMetricPayload[] };

    if (!metrics || !Array.isArray(metrics) || metrics.length === 0) {
      return NextResponse.json(
        { error: 'No health metrics provided to analyze' },
        { status: 400 }
      );
    }

    const xaiKey = process.env.XAI_API_KEY;
    if (!xaiKey) {
      return NextResponse.json(
        { error: 'AI API key is missing (XAI_API_KEY)' },
        { status: 500 }
      );
    }

    // Format metrics for the AI
    const metricsText = metrics
      .map((m, i) => {
        const parts = [`Check-in ${i + 1} (${m.date}):`];
        if (m.weight) parts.push(`Weight: ${m.weight} lbs`);
        if (m.sleep) parts.push(`Sleep: ${m.sleep} hrs`);
        if (m.water) parts.push(`Water: ${m.water} glasses`);
        if (m.energy) parts.push(`Energy: ${m.energy}/10`);
        if (m.mood) parts.push(`Mood: ${m.mood}`);
        if (m.heartRate) parts.push(`Heart Rate: ${m.heartRate} bpm`);
        if (m.notes) parts.push(`Notes: ${m.notes}`);
        return parts.join(' | ');
      })
      .join('\n');

    const userMessage = `Please analyze these ${metrics.length} recent health check-ins and provide wellness insights:\n\n${metricsText}`;

    // Call xAI directly
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${xaiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-4-1-fast-non-reasoning',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('xAI API Error:', errorText);
      return NextResponse.json(
        { error: 'Failed to generate insights' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || '';

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
      console.error('Failed to parse AI response:', aiResponse);
      // Return fallback insights
      insights = {
        weeklyFocus: 'Keep tracking your health metrics to reveal meaningful patterns!',
        mood: 'balanced',
        recommendations: [
          'Aim for 7-8 hours of quality sleep each night',
          'Stay hydrated with at least 8 glasses of water daily',
          'Check in regularly to build awareness of your health patterns',
        ],
        focusArea: 'Consistency in tracking',
        healthTrends: [
          { metric: 'Sleep', trend: 'Tracking in progress' },
          { metric: 'Hydration', trend: 'Tracking in progress' },
        ],
        quickTip: 'Log your check-in today to start seeing your trends!',
      };
    }

    // Validate and ensure proper structure
    return NextResponse.json({
      weeklyFocus: insights.weeklyFocus || insights.weeklyTrend || 'Keep tracking to discover your patterns!',
      mood: insights.mood || 'balanced',
      recommendations: Array.isArray(insights.recommendations)
        ? insights.recommendations.slice(0, 3)
        : [],
      focusArea: insights.focusArea || 'Overall wellness',
      healthTrends: Array.isArray(insights.healthTrends)
        ? insights.healthTrends.slice(0, 3)
        : [],
      quickTip: insights.quickTip || 'Take a moment to check in with how you feel today.',
    });
  } catch (error) {
    console.error('Health Insights Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}
