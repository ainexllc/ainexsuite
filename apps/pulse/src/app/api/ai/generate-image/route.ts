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

    // OpenRouter / Google Gemini specific request
    // Sometimes 'modalities' field isn't enough, and for image generation specifically 
    // providers might expect 'image' in the prompt text or a specific tool call structure.
    // However, sticking to the standard chat completion with prompt is the first step.
    
    // Let's log the response for debugging if it fails again to see the structure.
    console.log('Sending request to OpenRouter with prompt:', prompt);

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
            content: `Generate an image of: ${prompt}`
          }
        ],
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
    console.log('OpenRouter Response:', JSON.stringify(data, null, 2));

    const choice = data.choices?.[0];
    
    if (!choice) {
       return NextResponse.json(
        { error: 'No generation returned' },
        { status: 500 }
      );
    }

    let imageUrl = null;
    const messageContent = choice.message?.content;

    if (typeof messageContent === 'string') {
        // 1. Markdown image: ![alt](url)
        const markdownMatch = messageContent.match(/!\[.*?\]\((.*?)\)/);
        if (markdownMatch && markdownMatch[1]) {
            imageUrl = markdownMatch[1];
        } 
        // 2. Direct URL (starts with http)
        else if (messageContent.trim().startsWith('http')) {
            imageUrl = messageContent.trim();
        }
        // 3. Check for HTML <img> tag
        else {
            const htmlMatch = messageContent.match(/<img\s+src=["'](.*?)["']/);
            if (htmlMatch && htmlMatch[1]) {
                imageUrl = htmlMatch[1];
            }
        }
    }

    if (!imageUrl) {
         return NextResponse.json({ 
             error: 'No image URL found in response',
             details: messageContent 
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
