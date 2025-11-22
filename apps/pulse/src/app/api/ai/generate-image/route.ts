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

    const response = await fetch(`${apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ainexsuite.com', // Required by OpenRouter
        'X-Title': 'Pulse Workspace', // Required by OpenRouter
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro-image-preview',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        // Explicitly request image generation
        modalities: ["image"]
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

    // The structure of the response for image generation models can vary, 
    // but typically for chat completion endpoints returning images, 
    // the image url/base64 is often inside the content or a specific attachment field.
    // For Gemini via OpenRouter, it usually follows the standard OpenAI image generation or chat content structure.
    // Let's inspect the choice content.
    
    const choice = data.choices?.[0];
    
    if (!choice) {
       return NextResponse.json(
        { error: 'No generation returned' },
        { status: 500 }
      );
    }

    // Check for standard content (markdown with image) or message content
    let imageUrl = null;
    const messageContent = choice.message?.content;

    // Heuristic to find markdown image syntax ![alt](url) or just a raw URL
    if (typeof messageContent === 'string') {
        // Try to match markdown image
        const markdownMatch = messageContent.match(/!\[.*?\]\((.*?)\)/);
        if (markdownMatch && markdownMatch[1]) {
            imageUrl = markdownMatch[1];
        } else {
            // Sometimes it might just return the URL or Base64 directly
            // Check if content looks like a URL
            if (messageContent.startsWith('http') || messageContent.startsWith('data:image')) {
                imageUrl = messageContent;
            }
        }
    }

    // If still no image found, check if there's a specific 'image' field in the response (custom provider format)
    // But standard OpenRouter chat usually returns it in content.

    if (!imageUrl) {
         // Fallback: Return the raw content to let the frontend debug or display it
         // Ideally, for an image model, we want the image. 
         // If the model refused or generated text, we send that back as an error or info.
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

