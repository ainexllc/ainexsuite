import { NextRequest, NextResponse } from 'next/server';
import { promptService } from '@/lib/ai/prompt-service';

export async function POST(request: NextRequest) {
  try {
    const { userId, recentEntries } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Use prompt service to suggest next prompt
    const prompt = await promptService.suggestNextPrompt(userId, recentEntries || []);

    return NextResponse.json(prompt);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
