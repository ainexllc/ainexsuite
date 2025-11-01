import { NextRequest, NextResponse } from 'next/server';
import { enhanceJournalContent } from '@/lib/ai/content-enhancer';
import { ContentEnhancementStyle } from '@ainexsuite/types';

export async function POST(request: NextRequest) {
  try {
    const { content, style } = await request.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Missing content' }, { status: 400 });
    }

    if (!style || !['clarity', 'concise', 'warmth', 'reflection'].includes(style)) {
      return NextResponse.json({ error: 'Invalid style' }, { status: 400 });
    }

    const enhanced = await enhanceJournalContent(content, style as ContentEnhancementStyle);

    return NextResponse.json({ content: enhanced });
  } catch (error) {
    console.error('AI enhance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
