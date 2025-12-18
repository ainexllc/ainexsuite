import { NextRequest, NextResponse } from 'next/server';

interface HabitData {
  title: string;
  description?: string;
  currentStreak: number;
  bestStreak: number;
  isFrozen: boolean;
  scheduleType: string;
  lastCompletedAt?: string;
  createdAt: string;
}

export async function POST(req: NextRequest) {
  try {
    const { habits } = await req.json() as { habits: HabitData[] };

    if (!habits || habits.length < 2) {
      return NextResponse.json(
        { error: 'Need at least 2 habits for insights' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI API key configuration missing' },
        { status: 500 }
      );
    }

    // Construct habit context
    const habitsContext = habits.map((h, i) =>
      `Habit ${i + 1}: [${h.title}] Streak: ${h.currentStreak} days (best: ${h.bestStreak}), Schedule: ${h.scheduleType}${h.lastCompletedAt ? `, Last: ${h.lastCompletedAt.split('T')[0]}` : ', Never completed'}${h.description ? ` - ${h.description.slice(0, 80)}` : ''}`
    ).join('\n');

    const prompt = `Analyze the following habits from my habit tracking app and provide motivational, actionable insights.

${habitsContext}

Return ONLY a valid JSON object with this structure:
{
  "consistencyTrend": "One sentence about habit consistency and momentum",
  "focusArea": "What habit or area to prioritize today",
  "mood": "thriving",
  "strongestHabits": ["Habit 1", "Habit 2"],
  "needsAttention": ["Habit that needs work"],
  "suggestedHabit": "A new habit to consider adding",
  "motivationalTip": "One encouraging tip",
  "weeklyGoal": "Suggested goal for this week"
}

Field descriptions:
- "consistencyTrend": Summary of habit completion patterns (under 100 chars)
- "focusArea": Key habit or area to focus on today (under 100 chars)
- "mood": One word: thriving, growing, steady, struggling, starting, motivated, overwhelmed, neutral
- "strongestHabits": Top 2 habits with best streaks/consistency
- "needsAttention": Up to 2 habits that need more focus
- "suggestedHabit": Based on patterns, a complementary habit to consider
- "motivationalTip": Encouraging, specific suggestion (under 80 chars)
- "weeklyGoal": Achievable goal based on current progress (under 80 chars)

Be encouraging and focus on progress over perfection.`;

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-4-1-fast-non-reasoning',
        messages: [
          {
            role: 'system',
            content: 'You are a supportive habit coach. Respond only with valid JSON, no markdown formatting. Focus on encouragement and practical advice.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Grok API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to generate insights' },
        { status: 500 }
      );
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'No content in AI response' },
        { status: 500 }
      );
    }

    // Robust JSON extraction
    let jsonStr = content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    let insights;
    try {
      insights = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      // Return a safe fallback
      return NextResponse.json({
        consistencyTrend: 'Keep building your habits day by day.',
        focusArea: '',
        mood: 'neutral',
        strongestHabits: [],
        needsAttention: [],
        suggestedHabit: '',
        motivationalTip: 'Every small step counts toward your goals!',
        weeklyGoal: ''
      });
    }

    return NextResponse.json(insights);
  } catch (error) {
    console.error('Habit insights error:', error);
    return NextResponse.json(
      { error: 'Failed to generate habit insights' },
      { status: 500 }
    );
  }
}
