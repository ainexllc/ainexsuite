import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

interface HealthContext {
  recentMetrics: Array<{
    date: string;
    weight?: number | null;
    sleep?: number | null;
    water?: number | null;
    energy?: number | null;
    mood?: string | null;
  }>;
  goals: {
    dailyWaterGoal: number;
    targetWeight: number | null;
    sleepGoal: number;
    exerciseGoalDaily: number;
  };
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
  }>;
  wellnessScore: number;
  trends: {
    weight: 'up' | 'down' | 'stable';
    sleep: 'improving' | 'declining' | 'stable';
    energy: 'improving' | 'declining' | 'stable';
  };
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `You are a supportive and knowledgeable health assistant AI integrated into a personal health tracking app. Your role is to:

1. Provide helpful, evidence-based wellness guidance
2. Answer questions about health metrics, trends, and goals
3. Offer practical tips for improving sleep, hydration, exercise, and overall wellness
4. Be encouraging and supportive while promoting healthy habits
5. Help users understand their health data and patterns

Important guidelines:
- Always clarify that you're an AI assistant, not a medical professional
- Recommend consulting healthcare providers for medical concerns
- Be warm, conversational, and encouraging
- Keep responses concise but helpful (2-3 paragraphs max)
- Reference the user's actual health data when relevant
- Avoid making diagnoses or prescribing treatments
- Focus on general wellness and lifestyle improvements

You have access to the user's recent health metrics, goals, medications, and trends. Use this context to provide personalized insights and recommendations.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context, history } = body as {
      message: string;
      context: HealthContext;
      history: ConversationMessage[];
    };

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI API key not configured (GROK_API_KEY)' },
        { status: 500 }
      );
    }

    // Format health context for the AI
    let contextText = '';

    if (context) {
      contextText = '\n\nUser Health Context:\n';

      if (context.wellnessScore) {
        contextText += `- Current Wellness Score: ${context.wellnessScore}/100\n`;
      }

      if (context.goals) {
        contextText += `- Daily Water Goal: ${context.goals.dailyWaterGoal} glasses\n`;
        contextText += `- Sleep Goal: ${context.goals.sleepGoal} hours\n`;
        contextText += `- Daily Exercise Goal: ${context.goals.exerciseGoalDaily} minutes\n`;
        if (context.goals.targetWeight) {
          contextText += `- Target Weight: ${context.goals.targetWeight} lbs\n`;
        }
      }

      if (context.trends) {
        contextText += `- Weight Trend: ${context.trends.weight}\n`;
        contextText += `- Sleep Trend: ${context.trends.sleep}\n`;
        contextText += `- Energy Trend: ${context.trends.energy}\n`;
      }

      if (context.recentMetrics && context.recentMetrics.length > 0) {
        contextText += '\nRecent Health Metrics:\n';
        context.recentMetrics.slice(0, 7).forEach((m) => {
          const parts = [`${m.date}:`];
          if (m.weight) parts.push(`Weight ${m.weight}lbs`);
          if (m.sleep) parts.push(`Sleep ${m.sleep}hrs`);
          if (m.water) parts.push(`Water ${m.water} glasses`);
          if (m.energy) parts.push(`Energy ${m.energy}/10`);
          if (m.mood) parts.push(`Mood: ${m.mood}`);
          contextText += `- ${parts.join(', ')}\n`;
        });
      }

      if (context.medications && context.medications.length > 0) {
        contextText += '\nCurrent Medications:\n';
        context.medications.forEach((med) => {
          contextText += `- ${med.name} (${med.dosage}, ${med.frequency})\n`;
        });
      }
    }

    // Build conversation history
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT + contextText },
      ...history.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    // Call xAI API
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-4-1-fast-non-reasoning',
        messages,
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('xAI API Error:', errorText);
      return NextResponse.json(
        { error: 'Failed to generate response' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || '';

    if (!aiResponse) {
      return NextResponse.json(
        { error: 'No response generated' },
        { status: 500 }
      );
    }

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('Health Assistant Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}
