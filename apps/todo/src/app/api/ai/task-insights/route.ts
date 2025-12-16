import { NextRequest, NextResponse } from 'next/server';

interface TaskData {
  title: string;
  description?: string;
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

    // Construct task context
    const tasksContext = tasks.map((t, i) =>
      `Task ${i + 1}: [${t.title}] Status: ${t.status}, Priority: ${t.priority}${t.dueDate ? `, Due: ${t.dueDate}` : ''}${t.tags.length > 0 ? `, Tags: ${t.tags.join(', ')}` : ''}${t.description ? ` - ${t.description.slice(0, 100)}` : ''}`
    ).join('\n');

    const prompt = `Analyze the following tasks from my workspace and provide comprehensive productivity insights.

${tasksContext}

Return ONLY a valid JSON object with this structure:
{
  "productivityTrend": "One sentence about task completion patterns and momentum",
  "focusArea": "What to prioritize today based on deadlines and importance",
  "mood": "productive",
  "commonTags": ["Tag1", "Tag2", "Tag3"],
  "blockers": ["Potential blocker 1", "Potential blocker 2"],
  "topPriorities": [{"title": "Task name", "dueDate": "2024-01-15"}],
  "upcomingDeadlines": [{"title": "Task name", "dueDate": "2024-01-15"}],
  "quickTip": "One actionable productivity tip",
  "recommendations": ["Tip 1", "Tip 2", "Tip 3"]
}

Field descriptions:
- "productivityTrend": Summary of task completion patterns (under 100 chars)
- "focusArea": Key area to focus on today (under 100 chars)
- "mood": One word: productive, focused, overwhelmed, behind, steady, energized, stressed, neutral
- "commonTags": Top 3 recurring tags or themes from tasks
- "blockers": Up to 2 potential obstacles or tasks that might slow progress
- "topPriorities": Up to 2 most urgent/important tasks
- "upcomingDeadlines": Up to 2 tasks with nearest deadlines
- "quickTip": One specific, actionable suggestion (under 80 chars)
- "recommendations": 3 brief tips to improve productivity (under 80 chars each)`;

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
            content: 'You are a productivity coach. Respond only with valid JSON, no markdown formatting.'
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
        productivityTrend: 'Could not analyze tasks at this time.',
        focusArea: '',
        mood: 'neutral',
        commonTags: [],
        blockers: [],
        topPriorities: [],
        upcomingDeadlines: [],
        quickTip: '',
        recommendations: []
      });
    }

    return NextResponse.json(insights);
  } catch (error) {
    console.error('Task insights error:', error);
    return NextResponse.json(
      { error: 'Failed to generate task insights' },
      { status: 500 }
    );
  }
}
