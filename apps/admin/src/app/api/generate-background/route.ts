import { NextResponse } from 'next/server';
import type { BackgroundGenerationStyle } from '@ainexsuite/types';

// Google Gemini API configuration
const GEMINI_API_KEY = 'AIzaSyC5sXr68pNw29gnCctAQdFc1rfVeH9oFu0';
const GEMINI_MODEL = 'gemini-2.0-flash-preview-image-generation';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const STYLE_GUIDES: Record<BackgroundGenerationStyle, string> = {
  photorealistic: 'photorealistic, high-resolution photography style, natural lighting',
  artistic: 'artistic, painterly, creative interpretation, fine art style',
  abstract: 'abstract patterns, geometric shapes, modern art, creative composition',
  minimal: 'minimalist, clean, simple composition, subtle details',
  gradient: 'smooth color gradients, subtle transitions, soft blending',
};

function buildBackgroundPrompt(
  prompt: string,
  style?: BackgroundGenerationStyle,
  colorHint?: string
): string {
  let enhanced = `Create a beautiful, high-quality background image: ${prompt}.`;

  if (style && STYLE_GUIDES[style]) {
    enhanced += ` Style: ${STYLE_GUIDES[style]}.`;
  }

  if (colorHint) {
    enhanced += ` Incorporate ${colorHint} tones.`;
  }

  enhanced +=
    ' The image should work well as a desktop/mobile wallpaper background. No text, UI elements, or watermarks. High quality, visually appealing, full opaque image.';

  return enhanced;
}

export async function POST(request: Request) {
  try {
    const { prompt, style, colorHint } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Build enhanced prompt for background generation
    const enhancedPrompt = buildBackgroundPrompt(prompt, style, colorHint);

    // Call Google Gemini API directly
    const response = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: enhancedPrompt,
              },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      // eslint-disable-next-line no-console
      console.error('Gemini API error:', response.status, errorText);
      return NextResponse.json(
        {
          success: false,
          error: `Gemini API error: ${response.statusText}`,
          details: errorText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract image from Gemini response
    // Response structure: { candidates: [{ content: { parts: [...] } }] }
    let imageData: string | null = null;

    const candidates = data.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0]?.content?.parts;
      if (parts && Array.isArray(parts)) {
        for (const part of parts) {
          // Check for inline image data
          if (part.inlineData) {
            const mimeType = part.inlineData.mimeType || 'image/png';
            const base64Data = part.inlineData.data;
            imageData = `data:${mimeType};base64,${base64Data}`;
            break;
          }
          // Check for file data (alternative format)
          if (part.fileData) {
            // If it's a file URI, we'd need to fetch it
            // For now, handle inline data primarily
            imageData = part.fileData.fileUri;
            break;
          }
        }
      }
    }

    if (!imageData) {
      return NextResponse.json(
        {
          success: false,
          error: 'No image found in Gemini response',
          details: { candidates: data.candidates },
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      imageData,
      model: GEMINI_MODEL,
      provider: 'google-gemini',
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Background generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: String(error),
      },
      { status: 500 }
    );
  }
}
