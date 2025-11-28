import { NextRequest, NextResponse } from 'next/server';

interface TaskData {
  title: string;
  status: string;
  priority: string;
  dueDate?: string;
  tags: string[];
  subtasks: { title: string; isCompleted: boolean }[];
  createdAt: string;
  updatedAt: string;
}

export async function POST(req: NextRequest) {
  try {
    const { tasks } = await req.json() as { tasks: TaskData[] };

    if (!tasks || tasks.length < 2) {
      return NextResponse.json(
        { error: 'Need at least 2 tasks for insights' },
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

    const prompt = `You are a productivity coach analyzing task data. Based on the following tasks, provide brief, actionable insights.

Task Data (last ${tasks.length} tasks):
${JSON.stringify(tasks, null, 2)}

Respond in JSON format:
{
  "productivityTrend": "One sentence about overall task completion patterns and productivity",
  "recommendations": ["3 specific, actionable tips to improve task management"],
  "focusArea": "One key area to focus on today based on priorities and deadlines"
}

Keep each insight concise (under 100 characters for trend/focus, under 80 chars per recommendation). Be encouraging but practical.`;

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
            content: 'You are a productivity coach. Respond only with valid JSON, no markdown.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
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

    // Parse JSON from response
    const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
    const insights = JSON.parse(cleanedContent);

    return NextResponse.json(insights);
  } catch (error) {
    console.error('Task insights error:', error);
    return NextResponse.json(
      { error: 'Failed to generate task insights' },
      { status: 500 }
    );
  }
}
