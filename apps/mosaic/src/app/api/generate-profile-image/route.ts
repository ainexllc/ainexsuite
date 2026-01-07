import { NextRequest, NextResponse } from 'next/server';

// Google Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = 'gemini-3-pro-image-preview';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// Unified style type for both generation and transformation
type AvatarStyle =
  | 'pixar'
  | 'disney'
  | 'lego'
  | 'wool'
  | 'cyberpunk'
  | 'anime'
  | 'claymation'
  | 'cartoon'
  | 'pixel'
  | 'superhero'
  | 'watercolor'
  | 'pop-art';

// Style-specific prompts for generating avatars from text descriptions
const GENERATION_STYLES: Record<AvatarStyle, string> = {
  pixar: 'Pixar 3D animation style, smooth 3D render, big expressive eyes, soft lighting, high-quality CGI character, friendly and appealing',
  disney: 'Classic Disney 2D animation style, hand-drawn aesthetic, graceful lines, warm colors, magical and whimsical character design',
  lego: 'LEGO minifigure style, yellow plastic skin, simple dot eyes and curved smile, blocky proportions, shiny plastic texture, toy aesthetic',
  wool: 'Knitted plush toy style, cozy yarn texture, soft fuzzy appearance, handmade craft aesthetic, warm and cuddly character',
  cyberpunk: 'Cyberpunk futuristic style, neon glow effects, circuit patterns, holographic accents, dark background with vibrant neon highlights',
  anime: 'Japanese anime style, large expressive eyes, stylized colorful hair, clean lines, vibrant colors, manga aesthetic',
  claymation: 'Claymation stop-motion style like Wallace and Gromit, sculpted clay texture, fingerprint details, soft rounded forms, charming imperfections',
  cartoon: 'Bold cartoon style, exaggerated proportions, thick black outlines, bright saturated colors, fun and energetic character',
  pixel: 'Retro pixel art style, 16-bit aesthetic, chunky pixels, limited color palette, nostalgic video game character',
  superhero: 'Comic book superhero style, dramatic pose, bold colors, dynamic lines, heroic and powerful character design',
  watercolor: 'Delicate watercolor painting style, soft color washes, bleeding edges, paper texture visible, dreamy and ethereal',
  'pop-art': 'Andy Warhol pop art style, bold contrasting colors, halftone dot patterns, graphic and striking, retro 60s aesthetic',
};

// Style-specific prompts for transforming uploaded photos
const TRANSFORM_STYLES: Record<AvatarStyle, string> = {
  pixar: 'Transform into a Pixar 3D movie character, smooth 3D render with big expressive eyes, soft studio lighting, high-quality CGI look',
  disney: 'Transform into a classic Disney 2D animated character, hand-drawn aesthetic with graceful lines, warm magical colors',
  lego: 'Transform into a LEGO minifigure, yellow plastic skin, simple facial features with dot eyes, blocky proportions, shiny plastic toy look',
  wool: 'Transform into a knitted plush toy version, cozy yarn texture throughout, soft fuzzy appearance, handmade craft aesthetic',
  cyberpunk: 'Transform into a cyberpunk character, add neon glow effects, circuit patterns, holographic accents on dark background',
  anime: 'Transform into anime/manga style, large expressive eyes, stylized hair, clean lines, vibrant colors, Japanese animation aesthetic',
  claymation: 'Transform into a claymation character like Wallace and Gromit, sculpted clay texture with fingerprints, soft rounded forms',
  cartoon: 'Transform into a bold cartoon character, exaggerated features, thick black outlines, bright saturated colors, fun energetic style',
  pixel: 'Transform into retro 16-bit pixel art, chunky visible pixels, limited color palette, nostalgic video game aesthetic',
  superhero: 'Transform into a comic book superhero, dramatic heroic pose, bold colors, dynamic action lines, powerful character',
  watercolor: 'Transform into a delicate watercolor portrait, soft color washes, bleeding edges, visible paper texture, dreamy ethereal look',
  'pop-art': 'Transform into Andy Warhol pop art style, bold contrasting colors, halftone dot patterns, graphic striking retro 60s aesthetic',
};

function buildGenerationPrompt(
  userPrompt: string,
  style: AvatarStyle
): string {
  const styleGuide = GENERATION_STYLES[style] || GENERATION_STYLES.pixar;

  return `
Role: Expert Banner Designer creating unique profile header images.

## CRITICAL COMPOSITION RULES (MUST FOLLOW):

1. **WIDE RECTANGULAR FORMAT:** Generate a wide rectangular banner image with 16:9 aspect ratio (1280x720 pixels).

2. **BANNER COMPOSITION:**
   - Design should work as a horizontal header/banner.
   - Main subject or focal point should be positioned considering the wide format.
   - Can use panoramic, landscape-style compositions.
   - Leave some breathing room - don't overcrowd the image.

3. **CHARACTER/SUBJECT PLACEMENT:**
   - If including a character, position them interestingly within the wide frame.
   - Characters can be off-center for dynamic composition.
   - Consider negative space for potential text overlays (but don't add text).

## STRICT NEGATIVE CONSTRAINTS:
- **ABSOLUTELY NO TEXT, LETTERS, CHARACTERS, OR SYMBOLS.**
- **NO WATERMARKS** or logos.
- **NO REALISTIC HUMAN FACES** - stylized characters are OK.
- Keep the design visually interesting across the wide format.

## STYLE: ${styleGuide}

## USER REQUEST: ${userPrompt}

## FINAL OUTPUT:
- A beautiful, unique banner/header image.
- Wide rectangular format (16:9 aspect ratio, 1280x720).
- Professional quality suitable for a premium app.
- Visually interesting with good use of the horizontal space.
- Works well as a profile header or column banner.
`.trim();
}

function buildTransformPrompt(style: AvatarStyle): string {
  const styleGuide = TRANSFORM_STYLES[style] || TRANSFORM_STYLES.pixar;

  return `
Role: Expert Image Transformation Artist creating fun profile banner images.

## TASK:
${styleGuide}

## CRITICAL COMPOSITION RULES (MUST FOLLOW):

1. **WIDE RECTANGULAR FORMAT:** Output a wide rectangular banner with 16:9 aspect ratio (1280x720 pixels).

2. **BANNER COMPOSITION:**
   - Transform the subject to fit well in a horizontal header/banner format.
   - The subject can be positioned creatively within the wide frame.
   - Use the horizontal space effectively - can add styled background elements.

3. **PRESERVE IDENTITY:**
   - Maintain the essence/likeness of the original subject.
   - Keep recognizable features while applying the style transformation.
   - Subject should be prominent but doesn't need to fill the entire frame.

## STRICT CONSTRAINTS:
- **NO TEXT, LETTERS, OR SYMBOLS** in the output.
- **NO WATERMARKS.**
- Keep the result FUN and FRIENDLY.
- Make good use of the wide format.

## FINAL OUTPUT:
- A transformed banner image that's playful and unique.
- Wide rectangular format (16:9 aspect ratio, 1280x720).
- Professional quality suitable for a premium app.
- Works well as a profile header or column banner.
`.trim();
}

// Valid styles (same for both modes)
const VALID_STYLES: AvatarStyle[] = [
  'pixar', 'disney', 'lego', 'wool', 'cyberpunk', 'anime',
  'claymation', 'cartoon', 'pixel', 'superhero', 'watercolor', 'pop-art'
];

export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'GEMINI_API_KEY environment variable is not set' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { mode, prompt, style, sourceImage } = body;

    // Mode: 'generate' for text-to-image, 'transform' for image-to-image
    const isTransform = mode === 'transform';

    if (isTransform) {
      // Transform mode: requires source image and transform style
      if (!sourceImage) {
        return NextResponse.json(
          { success: false, error: 'Source image is required for transform mode' },
          { status: 400 }
        );
      }

      const transformStyle = VALID_STYLES.includes(style)
        ? style as AvatarStyle
        : 'pixar';

      const transformPrompt = buildTransformPrompt(transformStyle);

      // Extract base64 data from data URL if present
      let imageBase64 = sourceImage;
      let mimeType = 'image/jpeg';

      if (sourceImage.startsWith('data:')) {
        const matches = sourceImage.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          mimeType = matches[1];
          imageBase64 = matches[2];
        }
      }

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
                  text: transformPrompt,
                },
                {
                  inlineData: {
                    mimeType,
                    data: imageBase64,
                  },
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
      const imageData = extractImageFromResponse(data);

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
        mode: 'transform',
        style: transformStyle,
      });

    } else {
      // Generate mode: text-to-image
      if (!prompt) {
        return NextResponse.json(
          { success: false, error: 'Prompt is required for generate mode' },
          { status: 400 }
        );
      }

      const generateStyle = VALID_STYLES.includes(style)
        ? style as AvatarStyle
        : 'pixar';

      const enhancedPrompt = buildGenerationPrompt(prompt, generateStyle);

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
      const imageData = extractImageFromResponse(data);

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
        mode: 'generate',
        style: generateStyle,
      });
    }
  } catch (error) {
    console.error('Profile image generation error:', error);
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

// Helper to extract image from Gemini response
function extractImageFromResponse(data: { candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { mimeType?: string; data: string }; fileData?: { fileUri: string } }> } }> }): string | null {
  const candidates = data.candidates;
  if (candidates && candidates.length > 0) {
    const parts = candidates[0]?.content?.parts;
    if (parts && Array.isArray(parts)) {
      for (const part of parts) {
        if (part.inlineData) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          const base64Data = part.inlineData.data;
          return `data:${mimeType};base64,${base64Data}`;
        }
        if (part.fileData) {
          return part.fileData.fileUri;
        }
      }
    }
  }
  return null;
}
