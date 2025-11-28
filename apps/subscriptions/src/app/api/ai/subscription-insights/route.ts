import { NextRequest, NextResponse } from 'next/server';

interface SubscriptionData {
  name: string;
  cost: number;
  billingCycle: string;
  category: string;
}

export async function POST(req: NextRequest) {
  try {
    const { subscriptions } = await req.json() as { subscriptions: SubscriptionData[] };

    if (!subscriptions || subscriptions.length < 2) {
      return NextResponse.json(
        { error: 'Need at least 2 subscriptions for insights' },
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

    const prompt = `You are a financial advisor analyzing subscription expenses. Based on the following subscriptions, provide brief, actionable insights.

Subscription Data:
${JSON.stringify(subscriptions, null, 2)}

Respond in JSON format:
{
  "spendingTrend": "One sentence about the overall spending pattern (e.g., 'Your monthly spend is high in Entertainment.')",
  "recommendations": ["3 specific, actionable tips to save money or optimize subscriptions"],
  "projectedYearly": "A projected yearly cost estimate based on current data (just the number, e.g. '$1,200')",
  "anomalies": ["Any unusual or high-cost items identified"]
}

Keep it concise.`;

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
            content: 'You are a financial advisor. Respond only with valid JSON, no markdown.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
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
    console.error('Subscription insights error:', error);
    return NextResponse.json(
      { error: 'Failed to generate subscription insights' },
      { status: 500 }
    );
  }
}
