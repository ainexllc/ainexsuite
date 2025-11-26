import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

interface ColorGenerationRequest {
  appName: string;
  appDescription?: string;
  mood?: string;
}

// Color generation using Grok via xAI API
async function generateColorsWithGrok(appName: string, appDescription?: string, mood?: string): Promise<{ primary: string; secondary: string; provider: string }> {
  const apiKey = process.env.XAI_API_KEY;

  if (!apiKey) {
    throw new Error('XAI_API_KEY not configured');
  }

  const prompt = `Generate a BRIGHT, BOLD, and VIBRANT color palette for an app called "${appName}"${appDescription ? ` which is ${appDescription}` : ''}${mood ? ` with a ${mood} mood` : ''}.

Return ONLY a valid JSON object with no markdown formatting or code blocks. The object must contain exactly two keys:
- "primary": A BRIGHT, BOLD main brand color hex code
- "secondary": A complementary VIBRANT color hex code

Example response:
{"primary": "#FF5733", "secondary": "#33FF57"}`;

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'grok-2-latest',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Grok API error: ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  // Extract JSON from the response (handle potential markdown wrapping)
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse color response from Grok');
  }

  const colors = JSON.parse(jsonMatch[0]);

  // Validate hex color format
  const hexPattern = /^#[0-9A-Fa-f]{6}$/;
  if (!hexPattern.test(colors.primary) || !hexPattern.test(colors.secondary)) {
    throw new Error('Invalid hex color format received');
  }

  return { ...colors, provider: 'grok' };
}

// Color generation using Claude Sonnet via Anthropic API
async function generateColorsWithClaude(appName: string, appDescription?: string, mood?: string): Promise<{ primary: string; secondary: string; provider: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const prompt = `Generate a BRIGHT, BOLD, and VIBRANT color palette for an app called "${appName}"${appDescription ? ` which is ${appDescription}` : ''}${mood ? ` with a ${mood} mood` : ''}.

Return ONLY a JSON object with two hex color codes (including the # symbol):
- "primary": A BRIGHT, BOLD main brand color with high saturation (85-100%)
- "secondary": A complementary VIBRANT color that creates visual interest (can be analogous, complementary, or triadic)

REQUIREMENTS:
- Use BRIGHT, BOLD colors with HIGH saturation (85-100%)
- Avoid dull, muted, or pastel colors
- Create energetic, modern color combinations
- Ensure colors are visually distinct and eye-catching
- Good contrast for accessibility
- Each generation should produce DIFFERENT colors

Return format:
{"primary":"#hexcode","secondary":"#hexcode"}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.content[0].text;

  // Extract JSON from the response
  const jsonMatch = content.match(/\{[^}]+\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse color response from Claude');
  }

  const colors = JSON.parse(jsonMatch[0]);

  // Validate hex color format
  const hexPattern = /^#[0-9A-Fa-f]{6}$/;
  if (!hexPattern.test(colors.primary) || !hexPattern.test(colors.secondary)) {
    throw new Error('Invalid hex color format received');
  }

  return { ...colors, provider: 'claude' };
}

// Fallback: Smart color generation using color theory - generates bright, bold, varied colors
function generateColorsFallback(appName: string): { primary: string; secondary: string } {
  // Add timestamp to ensure different colors each time
  const timestamp = Date.now();
  const seed = appName + timestamp.toString();

  // Use seeded random for varied results
  const hash = seed.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  // Generate hue from hash (0-360) - distribute across color wheel
  const hue = Math.abs(hash % 360);

  // Use HIGH saturation and good lightness for BRIGHT, BOLD colors
  const primarySaturation = 85 + (Math.abs(hash) % 15); // 85-100% saturation
  const primaryLightness = 50 + (Math.abs(hash >> 8) % 15); // 50-65% lightness

  // Secondary color strategies for variety:
  // 1. Complementary (opposite on color wheel) - bold contrast
  // 2. Analogous (nearby) - harmonious
  // 3. Triadic (120 degrees) - vibrant
  const strategies = [
    { hueShift: 180, name: 'complementary' }, // Opposite
    { hueShift: 30, name: 'analogous' },      // Close
    { hueShift: 120, name: 'triadic' },       // Triadic
    { hueShift: 150, name: 'split-complementary' }, // Split complement
  ];

  const strategy = strategies[Math.abs(hash >> 16) % strategies.length];
  const secondaryHue = (hue + strategy.hueShift) % 360;

  // Make secondary slightly different in saturation/lightness for visual interest
  const secondarySaturation = 80 + (Math.abs(hash >> 12) % 20); // 80-100%
  const secondaryLightness = 55 + (Math.abs(hash >> 4) % 15); // 55-70%

  const hslToHex = (h: number, s: number, l: number): string => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  return {
    primary: hslToHex(hue, primarySaturation, primaryLightness),
    secondary: hslToHex(secondaryHue, secondarySaturation, secondaryLightness),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ColorGenerationRequest = await request.json();
    const { appName, appDescription, mood } = body;

    if (!appName) {
      return NextResponse.json(
        { error: 'App name is required' },
        { status: 400 }
      );
    }

    // Try AI generation with priority: Grok > Claude > Fallback
    let colors;
    let method = 'fallback';
    let provider = 'algorithm';

    // Try Grok first
    try {
      const result = await generateColorsWithGrok(appName, appDescription, mood);
      colors = { primary: result.primary, secondary: result.secondary };
      method = 'ai';
      provider = result.provider;
    } catch (grokError) {
      // Try Claude as fallback
      try {
        const result = await generateColorsWithClaude(appName, appDescription, mood);
        colors = { primary: result.primary, secondary: result.secondary };
        method = 'ai';
        provider = result.provider;
      } catch (claudeError) {
        // Use algorithmic fallback
        colors = generateColorsFallback(appName);
        method = 'fallback';
        provider = 'algorithm';
      }
    }

    return NextResponse.json({
      success: true,
      colors,
      method,
      provider,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to generate colors',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
