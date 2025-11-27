import { NextRequest, NextResponse } from 'next/server';

interface FeedbackItem {
  message: string;
  appId: string;
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

    // Get feedback items from request body
    const { feedbackItems } = await request.json();

    if (!feedbackItems || feedbackItems.length === 0) {
      return NextResponse.json({
        insights: {
          summary: 'No feedback available to analyze yet.',
          trends: [],
          actionItems: []
        }
      });
    }

    // Prepare feedback summary for Grok
    const feedbackSummary = feedbackItems
      .slice(0, 20) // Limit to recent 20 items
      .map((item: FeedbackItem, i: number) =>
        `${i + 1}. [${item.appId}] ${item.message}`
      ).join('\n');

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
            content: 'You are an AI assistant analyzing user feedback for a software product suite. Provide concise, actionable insights in JSON format with: summary (2-3 sentences), trends (array of 3-4 key patterns), and actionItems (array of 2-3 specific recommendations).'
          },
          {
            role: 'user',
            content: `Analyze this recent user feedback and provide insights:\n\n${feedbackSummary}\n\nProvide your analysis in this exact JSON format:\n{\n  "summary": "...",\n  "trends": ["...", "...", "..."],\n  "actionItems": ["...", "...", "..."]\n}`
          }
        ],
        model: 'grok-4-1-fast-non-reasoning',
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
      // Try to extract JSON from the response (Grok might wrap it in markdown)
      const jsonMatch = grokMessage.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[0]);
      } else {
        insights = JSON.parse(grokMessage);
      }
    } catch (parseError) {
      console.error('Failed to parse Grok response:', grokMessage);
      // Fallback insights
      insights = {
        summary: grokMessage.substring(0, 200) || 'Unable to generate insights at this time.',
        trends: ['Check feedback patterns manually'],
        actionItems: ['Review individual feedback items']
      };
    }

    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Error generating feedback insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
