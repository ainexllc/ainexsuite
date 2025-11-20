import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { content, title, existingTags } = await request.json();

    if (!content || !title) {
      return NextResponse.json({ error: 'Missing content or title' }, { status: 400 });
    }

    // Mock tag suggestions based on simple keyword matching
    const fullText = `${title} ${content}`.toLowerCase();
    const suggestions: Array<{
      tag: string;
      reason: string;
      confidence: number;
      category: string;
      isNew: boolean;
    }> = [];

    const tagPatterns = [
      { keywords: ['work', 'job', 'office', 'meeting', 'project'], tag: 'work', category: 'work', reason: 'Work-related content detected' },
      { keywords: ['family', 'mom', 'dad', 'sister', 'brother', 'parent'], tag: 'family', category: 'people', reason: 'Family references found' },
      { keywords: ['friend', 'hangout', 'social'], tag: 'friends', category: 'people', reason: 'Social interactions mentioned' },
      { keywords: ['exercise', 'workout', 'gym', 'run', 'fitness'], tag: 'fitness', category: 'health', reason: 'Physical activity mentioned' },
      { keywords: ['stress', 'anxious', 'worry', 'nervous'], tag: 'mental-health', category: 'emotions', reason: 'Mental health themes present' },
      { keywords: ['happy', 'joy', 'excited', 'great'], tag: 'positive', category: 'emotions', reason: 'Positive emotions expressed' },
      { keywords: ['sad', 'down', 'difficult', 'hard'], tag: 'challenging', category: 'emotions', reason: 'Challenging emotions noted' },
      { keywords: ['learn', 'study', 'course', 'book', 'reading'], tag: 'learning', category: 'activities', reason: 'Learning activities detected' },
      { keywords: ['goal', 'plan', 'future', 'achieve'], tag: 'goals', category: 'life', reason: 'Goal-oriented content' },
      { keywords: ['travel', 'trip', 'vacation', 'visit'], tag: 'travel', category: 'location', reason: 'Travel mentioned' },
    ];

    for (const pattern of tagPatterns) {
      const matches = pattern.keywords.filter(keyword => fullText.includes(keyword));
      if (matches.length > 0 && !existingTags?.includes(pattern.tag)) {
        suggestions.push({
          tag: pattern.tag,
          reason: pattern.reason,
          confidence: Math.min(0.9, 0.5 + (matches.length * 0.1)),
          category: pattern.category,
          isNew: true
        });
      }
    }

    // Limit to top 5 suggestions by confidence
    const topSuggestions = suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);

    return NextResponse.json(topSuggestions);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
