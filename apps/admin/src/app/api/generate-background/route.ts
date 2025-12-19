import { NextRequest, NextResponse } from 'next/server';

// Google Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = 'gemini-3-pro-image-preview';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

type BackgroundGenerationStyle =
  | 'photorealistic'
  | 'artistic'
  | 'abstract'
  | 'minimal'
  | 'gradient'
  | 'watercolor'
  | '3d-render'
  | 'cinematic'
  | 'neon'
  | 'vintage'
  | 'geometric'
  | 'bokeh'
  | 'ethereal'
  | 'cyberpunk'
  | 'texture'
  | 'oil-painting'
  | 'digital-art'
  | 'dreamy'
  | 'noir'
  | 'wool'
  | 'lego'
  | 'low-poly'
  | 'clay'
  | 'pixel-art'
  | 'paper-craft'
  | 'glass'
  | 'marble';
type BackgroundCategory = 'seasonal' | 'abstract' | 'nature' | 'minimal' | 'gradient' | 'festive' | 'other';
type BackgroundBrightness = 'light' | 'dark';

// Style-specific prompt enhancements
const STYLE_GUIDES: Record<BackgroundGenerationStyle, string> = {
  photorealistic: 'photorealistic photography, sharp details, professional quality, natural lighting, DSLR quality',
  artistic: 'artistic interpretation, painterly brushstrokes, fine art aesthetic, creative composition, museum quality',
  abstract: 'abstract art, geometric patterns, flowing shapes, modern design, contemporary aesthetics',
  minimal: 'minimalist design, clean composition, subtle textures, elegant simplicity, zen-like calm',
  gradient: 'smooth gradient transitions, soft color blending, atmospheric depth, seamless color flow',
  watercolor: 'watercolor painting, soft washes, bleeding edges, delicate textures, artistic fluidity, paper texture visible',
  '3d-render': '3D rendered, smooth surfaces, volumetric lighting, ray-traced reflections, Blender/Cinema4D aesthetic',
  cinematic: 'cinematic photography, dramatic lighting, film grain, anamorphic lens flare, movie poster quality, epic scale',
  neon: 'neon lights, glowing effects, synthwave vibes, electric colors, night city aesthetic, LED illumination',
  vintage: 'vintage aesthetic, retro color grading, film photography look, nostalgic mood, aged texture, faded tones',
  geometric: 'geometric shapes, mathematical patterns, sacred geometry, precise lines, tessellations, modern graphic design',
  bokeh: 'beautiful bokeh, soft focus, dreamy blur, light orbs, shallow depth of field, fairy lights effect',
  ethereal: 'ethereal atmosphere, soft glowing light, mystical mood, heavenly quality, delicate and airy, otherworldly',
  cyberpunk: 'cyberpunk aesthetic, holographic elements, tech noir, futuristic dystopia, rain-soaked streets, digital glitch',
  texture: 'rich textures, tactile surfaces, material study, fabric/stone/wood grain, sensory detail, macro photography',
  'oil-painting': 'oil painting technique, thick impasto brushwork, rich pigments, classical art style, canvas texture',
  'digital-art': 'digital illustration, clean vectors, modern design, graphic art, polished aesthetic, contemporary illustration',
  dreamy: 'dreamlike quality, surreal atmosphere, soft edges, fantasy elements, magical realism, cloud-like softness',
  noir: 'film noir style, high contrast black and white, dramatic shadows, moody atmosphere, 1940s detective aesthetic',
  wool: 'felted wool texture, soft fuzzy fibers, knitted aesthetic, cozy handcrafted look, yarn-like quality, textile art',
  lego: 'LEGO brick style, plastic toy aesthetic, blocky construction, bright primary colors, playful 3D render',
  'low-poly': 'low polygon 3D art, faceted geometric shapes, triangulated surfaces, stylized game art, angular minimal design',
  clay: 'claymation style, sculpted clay texture, handmade stop-motion look, plasticine quality, soft rounded forms',
  'pixel-art': '8-bit pixel art, retro video game aesthetic, crisp pixels, limited color palette, nostalgic gaming style',
  'paper-craft': 'paper craft art, origami folds, layered paper cutouts, handmade collage, cardstock texture',
  glass: 'glass material, transparent and reflective, refractive light effects, crystal clarity, stained glass elements',
  marble: 'marble texture, veined stone patterns, polished surface, elegant natural stone, classical sculpture quality',
};

// Category-specific mood and atmosphere guidance
const CATEGORY_MOODS: Record<BackgroundCategory, string> = {
  seasonal: 'seasonal atmosphere, weather-appropriate mood, time-of-year feeling, holiday spirit if applicable',
  abstract: 'thought-provoking visuals, creative interpretation, non-representational forms, artistic expression',
  nature: 'natural landscapes, organic textures, earthy tones, peaceful outdoor scenes, connection to environment',
  minimal: 'clean and uncluttered, breathing space, subtle sophistication, calming presence',
  gradient: 'smooth transitions, atmospheric depth, soft color harmony, meditative quality',
  festive: 'celebratory mood, warm and inviting, joyful atmosphere, festive colors and elements',
  other: 'versatile aesthetic, balanced composition, universally appealing',
};

// Brightness-specific guidance
const BRIGHTNESS_GUIDES: Record<BackgroundBrightness, string> = {
  dark: 'dark color palette, deep rich tones, suitable for light text overlay, moody atmosphere, blacks and deep colors dominate',
  light: 'light color palette, bright and airy, suitable for dark text overlay, uplifting atmosphere, whites and pale colors dominate',
};

function buildBackgroundPrompt(
  userPrompt: string,
  options: {
    style?: BackgroundGenerationStyle;
    category?: BackgroundCategory;
    brightness?: BackgroundBrightness;
    colorHint?: string;
  }
): string {
  const { style, category, brightness, colorHint } = options;

  const parts: string[] = [
    'Role: Expert UI/UX Asset Designer.',
    'Task: Generate a professional background image for a content-heavy app (Notes, Journal, Tasks).',
    '',
    '## CRITICAL COMPOSITION RULES (MUST FOLLOW):',
    '1. **THE "SAFE ZONE" RULE:** The central 70% of the image MUST be visually quiet, clean, and uniform. This is where user text will sit.',
    '   - NO distinct objects, sharp patterns, or high-contrast details in the center.',
    '   - The center should be a solid color, a very soft gradient, or a subtle texture (like paper grain or smooth stone).',
    '2. **EDGE DETAILS:** Push all artistic flourishes, stronger textures, or distinct shapes to the outer 15-20% edges (corners/borders).',
    '   - Think "Vignette" or "Frame" style composition.',
    '3. **CONTRAST CONTROL:**',
    '   - Low local contrast in the center (smooth).',
    '   - Global contrast should be managed to support text legibility.',
    '',
    '## STRICT NEGATIVE CONSTRAINTS:',
    '- **ABSOLUTELY NO TEXT, LETTERS, CHARACTERS, OR SYMBOLS** in the image itself.',
    '- **NO WATERMARKS** or logos.',
    '- NO faces or people.',
    '- NO busy patterns in the center.',
    '',
    '## ASPECT RATIO & SCALING:',
    '- The image will be cropped to both 16:9 (Desktop) and 9:16 (Mobile).',
    '- A uniform or gradient center ensures the image looks good in ANY crop.',
    '',
    `## USER REQUEST: ${userPrompt}`,
  ];

  if (style && STYLE_GUIDES[style]) {
    parts.push('', `## STYLE: ${STYLE_GUIDES[style]}`);
    parts.push('- ADAPTATION: Adapt this style to be "background-friendly". Mute the effect in the center.');
  }

  if (category && CATEGORY_MOODS[category]) {
    parts.push('', `## MOOD: ${CATEGORY_MOODS[category]}`);
  }

  if (brightness && BRIGHTNESS_GUIDES[brightness]) {
    parts.push(
      '',
      `## BRIGHTNESS MODE: ${brightness.toUpperCase()}`,
      `GUIDE: ${BRIGHTNESS_GUIDES[brightness]}`,
      brightness === 'dark'
        ? '- TARGET: Deep, dark tones in the center (e.g., charcoal, navy, black, dark slate). The center must be dark enough for WHITE text.'
        : '- TARGET: Bright, light tones in the center (e.g., white, cream, soft pastel, light grey). The center must be light enough for BLACK text.'
    );
  }

  if (colorHint) {
    parts.push('', `## COLOR PALETTE: ${colorHint}`);
  }

  parts.push(
    '',
    '## FINAL OUTPUT:',
    '- A polished, high-resolution image.',
    '- Looks like a premium app background, not a stock photo.',
    '- Opaque (no alpha channel).'
  );

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
    const { prompt, style, category, brightness, colorHint } = body;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const enhancedPrompt = buildBackgroundPrompt(prompt, {
      style,
      category,
      brightness,
      colorHint,
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
