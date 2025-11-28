import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { messages, systemPrompt, context } = await request.json() as {
      messages: ChatMessage[];
      systemPrompt?: string;
      context?: string;
    };

    const xaiKey = process.env.XAI_API_KEY;
    if (!xaiKey) {
      return NextResponse.json(
        { error: 'AI API key is missing (XAI_API_KEY)' },
        { status: 500 }
      );
    }

    // Build messages array
    const chatMessages: ChatMessage[] = [];

    // Add system prompt if provided
    if (systemPrompt) {
      chatMessages.push({ role: 'system', content: systemPrompt });
    }

    // Add context as system message if provided
    if (context) {
      chatMessages.push({ role: 'system', content: `Context:\n${context}` });
    }

    // Add conversation messages
    if (messages && Array.isArray(messages)) {
      chatMessages.push(...messages);
    }

    // Call xAI Grok directly
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${xaiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-4-1-fast-non-reasoning',
        messages: chatMessages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('xAI API Error:', errorText);
      return NextResponse.json(
        { error: 'Failed to process AI request' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({
      message: aiResponse,
      role: 'assistant',
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process AI request' },
      { status: 500 }
    );
  }
}
