import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    const apiUrl = process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1';

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      );
    }

    // Use OpenRouter's Stable Diffusion 3.5 Large for image generation
    // This model is specifically designed for image generation and works via standard API
    // eslint-disable-next-line no-console
    console.log('Sending image generation request to OpenRouter with prompt:', prompt);

    const response = await fetch(`${apiUrl}/images/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ainexsuite.com',
        'X-Title': 'Pulse Workspace',
      },
      body: JSON.stringify({
        model: 'openai/dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      return NextResponse.json(
        { error: `OpenRouter API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    // eslint-disable-next-line no-console
    console.log('OpenRouter Response:', JSON.stringify(data, null, 2));

    // Handle image generation response format
    const imageUrl = data.data?.[0]?.url;

    if (!imageUrl) {
      return NextResponse.json({
        error: 'No image URL found in response',
        details: data,
      }, { status: 422 });
    }

    return NextResponse.json({ imageUrl });

  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
