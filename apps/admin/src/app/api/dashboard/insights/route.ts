import { NextRequest, NextResponse } from 'next/server';

interface CommitItem {
  message: string;
  author: string;
  timestamp: number;
}

interface SystemMetric {
  name: string;
  value: number;
  status?: string;
}

export async function POST(request: NextRequest) {
  try {
    const grokApiKey = process.env.GROK_API_KEY;

    if (!grokApiKey) {
      return NextResponse.json(
        { error: 'Grok API key not configured' },
        { status: 500 }
      );
    }

    // Get data from request body
    const { commits, metrics, stats } = await request.json();

    if (!commits || commits.length === 0) {
      return NextResponse.json({
        insights: {
          summary: 'Insufficient data to generate insights.',
          highlights: [],
          recommendations: []
        }
      });
    }

    // Prepare dashboard summary for Grok
    const commitsSummary = commits
      .slice(0, 10)
      .map((c: CommitItem, i: number) => `${i + 1}. ${c.message} (by ${c.author})`)
      .join('\n');

    const systemSummary = metrics
      ? metrics.map((m: SystemMetric) => `- ${m.name}: ${m.value}${m.status ? ` (${m.status})` : ''}`).join('\n')
      : '';

    const context = `
Recent Development Activity:
${commitsSummary}

${systemSummary ? `System Metrics:\n${systemSummary}` : ''}

${stats ? `Platform Stats:\n- Total Users: ${stats.totalUsers}\n- Feedback Items: ${stats.totalFeedback}\n- Active Sessions: ${stats.activeNow}` : ''}
    `.trim();

    // Call Grok API
    const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${grokApiKey}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant analyzing platform metrics and development activity. Provide concise, actionable insights in JSON format with: summary (2-3 sentences about overall health and activity), highlights (array of 3-4 positive observations), and recommendations (array of 2-3 strategic suggestions).'
          },
          {
            role: 'user',
            content: `Analyze this platform data and provide insights:\n\n${context}\n\nProvide your analysis in this exact JSON format:\n{\n  "summary": "...",\n  "highlights": ["...", "...", "..."],\n  "recommendations": ["...", "...", "..."]\n}`
          }
        ],
        model: 'grok-3',
        temperature: 0.7,
      }),
    });

    if (!grokResponse.ok) {
      const errorText = await grokResponse.text();
      console.error('Grok API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to get insights from Grok API' },
        { status: grokResponse.status }
      );
    }

    const grokData = await grokResponse.json();
    const grokMessage = grokData.choices?.[0]?.message?.content || '';

    // Parse Grok's JSON response
    let insights;
    try {
      const jsonMatch = grokMessage.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[0]);
      } else {
        insights = JSON.parse(grokMessage);
      }
    } catch (parseError) {
      console.error('Failed to parse Grok response:', grokMessage);
      insights = {
        summary: grokMessage.substring(0, 200) || 'Unable to generate insights at this time.',
        highlights: ['Active development ongoing'],
        recommendations: ['Continue monitoring metrics']
      };
    }

    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Error generating dashboard insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
