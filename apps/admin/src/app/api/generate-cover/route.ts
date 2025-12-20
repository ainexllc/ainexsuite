import { NextRequest, NextResponse } from 'next/server';
import { COVER_STYLE_GUIDES, type CoverGenerationStyle, type CoverCategory } from '@ainexsuite/types';

// Google Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = 'gemini-3-pro-image-preview';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// Category-specific prompt enhancement
const CATEGORY_GUIDES: Record<CoverCategory, string> = {
  leather: 'Rich leather material with authentic grain patterns, natural material quality, book binding aesthetic',
  fabric: 'Textile weave patterns, soft tactile surface, cloth book cover feel, handcrafted quality',
  paper: 'Paper-based textures, handmade paper quality, fiber patterns, natural organic material',
  wood: 'Natural wood grain, organic patterns, warm earthy material, craftsmanship quality',
  artistic: 'Hand-painted artistic texture, creative brushwork, fine art aesthetic, gallery quality',
  minimal: 'Clean subtle design, understated elegance, refined simplicity, modern sophistication',
  pattern: 'Decorative pattern, elegant repeat design, sophisticated motif, ornamental quality',
  other: 'Premium texture, elegant material quality, refined aesthetic',
};

function buildCoverPrompt(
  userPrompt: string,
  options: {
    style: CoverGenerationStyle;
    category: CoverCategory;
  }
): string {
  const { style, category } = options;

  const styleGuide = COVER_STYLE_GUIDES[style] || '';
  const categoryGuide = CATEGORY_GUIDES[category] || '';

  const parts: string[] = [
    'Role: Expert Book Cover & Texture Designer.',
    'Task: Generate a premium journal cover texture image.',
    '',
    '## CRITICAL REQUIREMENTS:',
    '1. **TEXTURE FOCUS:** This is a decorative cover texture, NOT a full illustration.',
    '   - Create a rich, tactile material surface (leather, fabric, paper, wood, etc.)',
    '   - The texture should be seamless and suitable for tiling/cropping',
    '2. **PORTRAIT ORIENTATION:** Optimized for 2:3 aspect ratio (like a book cover)',
    '3. **NO TEXT OR SYMBOLS:** Absolutely no letters, words, logos, or symbols',
    '4. **PREMIUM QUALITY:** High-resolution, professional material photography quality',
    '',
    '## COMPOSITION GUIDELINES:',
    '- The texture should be relatively uniform across the entire image',
    '- Subtle variations in tone and texture are encouraged for authenticity',
    '- Avoid hard edges, distinct objects, or focal points',
    '- The image should work as a background for overlaid journal titles',
    '',
    `## MATERIAL STYLE: ${styleGuide}`,
    '',
    `## CATEGORY: ${categoryGuide}`,
    '',
    `## ADDITIONAL DETAILS: ${userPrompt || 'Create an elegant, premium cover texture'}`,
    '',
    '## COLOR GUIDANCE:',
    '- Rich, warm tones typical of quality journal covers',
    '- Natural material colors (browns, tans, creams, grays)',
    '- Avoid overly bright or neon colors',
    '- The overall tone should be sophisticated and timeless',
    '',
    '## FINAL OUTPUT:',
    '- A polished, high-resolution texture image',
    '- Looks like a premium journal or book cover material',
    '- Suitable for use as a card cover in a digital journal app',
    '- Opaque (no alpha channel)',
  ];

  return parts.join('\n');
}

export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'GEMINI_API_KEY environment variable is not set' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { prompt, style, category } = body;

    if (!style || !category) {
      return NextResponse.json(
        { success: false, error: 'Style and category are required' },
        { status: 400 }
      );
    }

    const enhancedPrompt = buildCoverPrompt(prompt || '', {
      style,
      category,
    });

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

    let imageData: string | null = null;

    const candidates = data.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0]?.content?.parts;
      if (parts && Array.isArray(parts)) {
        for (const part of parts) {
          if (part.inlineData) {
            const mimeType = part.inlineData.mimeType || 'image/png';
            const base64Data = part.inlineData.data;
            imageData = `data:${mimeType};base64,${base64Data}`;
            break;
          }
          if (part.fileData) {
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
    console.error('Cover generation error:', error);
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
