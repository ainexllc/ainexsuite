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

    // eslint-disable-next-line no-console
    console.log('Sending image generation request to OpenRouter with prompt:', prompt);

    // Use Gemini 3 Pro with image generation capability
    // Requires modalities: ['image', 'text'] to enable image generation
    const response = await fetch(`${apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ainexsuite.com',
        'X-Title': 'Pulse Workspace',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro-image-preview',
        messages: [
          {
            role: 'user',
            content: prompt,
          }
        ],
        modalities: ['image', 'text'],
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
    let imageUrl = null;

    // Gemini format: message.images array with image_url.url
    const message = data.choices?.[0]?.message;
    if (message?.images && Array.isArray(message.images)) {
      const firstImage = message.images[0];
      const imageDataUrl = firstImage?.image_url?.url;
      if (imageDataUrl) {
        imageUrl = imageDataUrl;
      }
    }

    // Fallback: try to extract from message content if no images array
    if (!imageUrl && message?.content) {
      if (typeof message.content === 'string') {
        if (message.content.trim().startsWith('data:')) {
          // Base64 data URL
          imageUrl = message.content.trim();
        } else if (message.content.trim().startsWith('http')) {
          // Regular URL
          imageUrl = message.content.trim();
        } else {
          // Try markdown format
          const markdownMatch = message.content.match(/!\[.*?\]\((.*?)\)/);
          if (markdownMatch && markdownMatch[1]) {
            imageUrl = markdownMatch[1];
          }
        }
      }
    }

    if (!imageUrl) {
      return NextResponse.json({
        error: 'No image URL found in response',
        details: { message, fullResponse: data },
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
