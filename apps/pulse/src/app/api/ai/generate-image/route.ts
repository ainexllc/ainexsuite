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

    // Use OpenRouter's Stable Diffusion 3 for image generation
    // This is more reliable than DALL-E 3 on OpenRouter's chat API
    const response = await fetch(`${apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ainexsuite.com',
        'X-Title': 'Pulse Workspace',
      },
      body: JSON.stringify({
        model: 'stabilityai/stable-diffusion-3',
        messages: [
          {
            role: 'user',
            content: prompt,
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      // eslint-disable-next-line no-console
      console.error('OpenRouter API error:', response.status, errorText);
      return NextResponse.json(
        {
          error: `OpenRouter API error: ${response.statusText}`,
          details: errorText
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    // eslint-disable-next-line no-console
    console.log('OpenRouter Response:', JSON.stringify(data, null, 2));

    // Extract image URL from response
    const choice = data.choices?.[0];
    if (!choice) {
      return NextResponse.json({
        error: 'No response from OpenRouter',
        details: data,
      }, { status: 422 });
    }

    const messageContent = choice.message?.content;
    let imageUrl = null;

    if (typeof messageContent === 'string') {
      // Try various URL patterns
      // 1. Direct URL (http/https)
      if (messageContent.trim().startsWith('http')) {
        imageUrl = messageContent.trim();
      }
      // 2. Markdown image format: ![alt](url)
      else {
        const markdownMatch = messageContent.match(/!\[.*?\]\((.*?)\)/);
        if (markdownMatch && markdownMatch[1]) {
          imageUrl = markdownMatch[1];
        }
      }
    }

    if (!imageUrl) {
      return NextResponse.json({
        error: 'No image URL found in response',
        details: { content: messageContent, fullResponse: data },
      }, { status: 422 });
    }

    return NextResponse.json({ imageUrl });

  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
