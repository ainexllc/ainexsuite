import { NextRequest, NextResponse } from 'next/server';
import { sentimentService } from '@/lib/ai/sentiment-service';
import type { MoodType } from '@ainexsuite/types';

export async function POST(request: NextRequest) {
  try {
    const { content, title, entryId, userId } = await request.json();

    if (!content || !title) {
      return NextResponse.json({ error: 'Missing content or title' }, { status: 400 });
    }

    // Create a mock journal entry for analysis
    const entry = {
      id: entryId || 'temp-id',
      title,
      content,
      userId: userId || 'temp-user',
      ownerId: userId || 'temp-user',
      spaceId: 'personal', // Required - 'personal' for personal content
      tags: [],
      mood: 'neutral' as MoodType,
      date: new Date().toISOString().split('T')[0],
      isDraft: false,
      isPrivate: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      attachments: [],
      links: [],
      mediaUrls: []
    };

    // Analyze the entry using our sentiment service
    const analysis = await sentimentService.analyzeEntry(entry);

    return NextResponse.json(analysis);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
