import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { appName, messages, systemPrompt, context } = await request.json();

    // Call Cloud Function
    const response = await fetch(
      'https://us-central1-alnexsuite.cloudfunctions.net/chatWithGrok',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            appName,
            messages,
            systemPrompt,
            context,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to call AI service');
    }

    const data = await response.json();
    return NextResponse.json(data.result);
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
}
