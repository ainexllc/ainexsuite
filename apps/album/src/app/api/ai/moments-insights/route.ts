import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

interface MomentPayload {
  title: string;
  caption?: string;
  date: string;
  mood?: string;
  people?: string[];
  location?: string;
  weather?: string;
}

const SYSTEM_PROMPT = `You are a warm, nostalgic AI that analyzes captured moments and memories. You speak only valid JSON.

Return ONLY valid JSON with this exact structure (no markdown, no code blocks, just raw JSON):
{
  "highlight": "A warm 1-2 sentence highlight about the most memorable pattern or moment",
  "topPeople": ["Person1", "Person2", "Person3"],
  "moodTrend": "A brief description of the overall emotional trend"
}

Guidelines:
- highlight: Find the most meaningful pattern or standout memory from the moments
- topPeople: Extract up to 3 most frequently mentioned people. If none, use ["Just you"]
- moodTrend: Summarize the overall mood/emotional arc across moments

Keep responses warm, personal, and celebratory of life's moments.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { moments } = body as { moments: MomentPayload[] };

    if (!moments || !Array.isArray(moments) || moments.length === 0) {
      return NextResponse.json(
        { error: 'No moments provided to analyze' },
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

    // Format moments for the AI
    const momentsText = moments
      .map((m, i) => {
        const parts = [`Moment ${i + 1} (${m.date}): "${m.title}"`];
        if (m.caption) parts.push(`Caption: ${m.caption}`);
        if (m.mood) parts.push(`Mood: ${m.mood}`);
        if (m.people?.length) parts.push(`People: ${m.people.join(', ')}`);
        if (m.location) parts.push(`Location: ${m.location}`);
        if (m.weather) parts.push(`Weather: ${m.weather}`);
        return parts.join(' | ');
      })
      .join('\n');

    const userMessage = `Analyze these ${moments.length} captured moments and provide insights:\n\n${momentsText}`;

    // Call xAI Grok directly
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
        highlight: "You're capturing life's beautiful moments!",
        topPeople: ['Just you'],
        moodTrend: 'A mix of meaningful experiences',
      };
    }

    // Validate and ensure proper structure
    return NextResponse.json({
      highlight: insights.highlight || "Keep capturing those special moments!",
      topPeople: Array.isArray(insights.topPeople) ? insights.topPeople.slice(0, 3) : ['Just you'],
      moodTrend: insights.moodTrend || 'Varied experiences',
    });
  } catch (error) {
    console.error('Moments Insights Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}
