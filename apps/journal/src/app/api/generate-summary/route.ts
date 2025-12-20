import { NextRequest, NextResponse } from 'next/server';
import { serverEnv } from '@/env';

// Google Gemini API configuration for text generation
const GEMINI_API_KEY = serverEnv.GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

function buildSummaryPrompt(content: string, title?: string): string {
  // Strip HTML tags from content
  const plainContent = content
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

  return `You are summarizing a personal journal entry. Create a brief, engaging summary that captures the essence and emotional tone of the entry.

RULES:
- Write 2-3 sentences maximum
- Keep it personal and reflective (first person if the original is first person)
- Capture the main theme, mood, or key moment
- Do not start with "This entry..." or "The author..."
- Write as if continuing the person's voice
- Be concise but meaningful

${title ? `Title: ${title}` : ''}
Journal Entry:
${plainContent.substring(0, 2000)}

Summary:`;
}

export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      console.error('[generate-summary] GEMINI_API_KEY is not set');
      return NextResponse.json(
        { success: false, error: 'GEMINI_API_KEY environment variable is not set' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { content, title } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      );
    }

    const prompt = buildSummaryPrompt(content, title);

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
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 150,
          topP: 0.95,
          topK: 40,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[generate-summary] Gemini API error:', response.status, errorText);
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

    let summary: string | null = null;

    const candidates = data.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0]?.content?.parts;
      if (parts && Array.isArray(parts)) {
        for (const part of parts) {
          if (part.text) {
            summary = part.text.trim();
            break;
          }
        }
      }
    }

    if (!summary) {
      console.error('[generate-summary] No summary generated from response:', data);
      return NextResponse.json(
        {
          success: false,
          error: 'No summary generated',
          details: { candidates: data.candidates },
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      summary,
      model: GEMINI_MODEL,
      provider: 'google-gemini',
    });
  } catch (error) {
    console.error('[generate-summary] Error:', error);
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
