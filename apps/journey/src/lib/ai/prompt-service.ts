import {
  ReflectivePrompt,
  PersonalizedPrompt,
  PromptInsight,
  JournalEntry
} from '@ainexsuite/types';

export interface IPromptService {
  getPersonalizedPrompt(userId: string, context: any): Promise<PersonalizedPrompt>;
  generateFollowUp(prompt: ReflectivePrompt, response: string): Promise<string>;
  analyzePromptEffectiveness(userId: string): Promise<PromptInsight[]>;
  suggestNextPrompt(userId: string, recentEntries: JournalEntry[]): Promise<ReflectivePrompt>;
  suggestMultiplePrompts(userId: string, recentEntries: JournalEntry[]): Promise<ReflectivePrompt[]>;
}

// Default prompts database
const defaultPrompts: ReflectivePrompt[] = [
  {
    id: 'gratitude-1',
    text: 'What three things are you grateful for today, and why?',
    category: 'gratitude',
    contextTriggers: { timeOfDay: 'evening' },
    followUpQuestions: [
      'How did these things make you feel?',
      'How can you cultivate more of these moments?'
    ],
    tags: ['gratitude', 'reflection', 'daily'],
    difficulty: 'easy',
    estimatedTime: 5
  },
  {
    id: 'growth-1',
    text: 'What\'s one thing you learned about yourself this week?',
    category: 'growth',
    contextTriggers: { dayOfWeek: 0 }, // Sunday
    followUpQuestions: [
      'How can you use this insight moving forward?',
      'What surprised you about this discovery?'
    ],
    tags: ['growth', 'self-awareness', 'learning'],
    difficulty: 'medium',
    estimatedTime: 10
  },
  {
    id: 'challenge-1',
    text: 'What challenge are you facing right now, and what\'s one small step you can take toward addressing it?',
    category: 'challenge',
    contextTriggers: {},
    followUpQuestions: [
      'What support or resources might help you?',
      'What is holding you back from taking that step?'
    ],
    tags: ['challenge', 'problem-solving', 'action'],
    difficulty: 'medium',
    estimatedTime: 10
  },
  {
    id: 'creativity-1',
    text: 'If you could do anything today without limitations, what would it be?',
    category: 'creativity',
    contextTriggers: { timeOfDay: 'morning' },
    followUpQuestions: [
      'What aspects of this appeal to you most?',
      'What is one element you could incorporate into your actual day?'
    ],
    tags: ['creativity', 'imagination', 'possibilities'],
    difficulty: 'easy',
    estimatedTime: 5
  },
  {
    id: 'relationship-1',
    text: 'Think about a meaningful interaction you had recently. What made it special?',
    category: 'relationship',
    contextTriggers: {},
    followUpQuestions: [
      'How did this person impact your day?',
      'What can you learn from this interaction?'
    ],
    tags: ['relationships', 'connection', 'social'],
    difficulty: 'easy',
    estimatedTime: 7
  },
  {
    id: 'reflection-1',
    text: 'Looking at your recent journal entries, what patterns or themes do you notice?',
    category: 'reflection',
    contextTriggers: {},
    followUpQuestions: [
      'What do these patterns reveal about your current state?',
      'Is there anything you would like to change?'
    ],
    tags: ['reflection', 'meta', 'patterns'],
    difficulty: 'deep',
    estimatedTime: 15
  },
  {
    id: 'mindfulness-1',
    text: 'Take a moment to notice: What are you feeling right now, physically and emotionally?',
    category: 'mindfulness',
    contextTriggers: {},
    followUpQuestions: [
      'Where do you feel these sensations in your body?',
      'What might these feelings be trying to tell you?'
    ],
    tags: ['mindfulness', 'awareness', 'present-moment'],
    difficulty: 'easy',
    estimatedTime: 5
  }
];

function getPromptsByContext(context: {
  mood?: string;
  timeOfDay?: string;
  dayOfWeek?: number;
  keywords?: string[];
}): ReflectivePrompt[] {
  return defaultPrompts.filter(prompt => {
    const triggers = prompt.contextTriggers;

    if (triggers.timeOfDay && context.timeOfDay && triggers.timeOfDay !== context.timeOfDay) {
      return false;
    }

    if (triggers.dayOfWeek !== undefined && context.dayOfWeek !== undefined && triggers.dayOfWeek !== context.dayOfWeek) {
      return false;
    }

    if (triggers.mood && context.mood && triggers.mood !== context.mood) {
      return false;
    }

    if (triggers.keywords && context.keywords) {
      const hasMatchingKeyword = triggers.keywords.some(keyword =>
        context.keywords!.some(ck => ck.toLowerCase().includes(keyword.toLowerCase()))
      );
      if (!hasMatchingKeyword) return false;
    }

    return true;
  });
}

// Mock implementation for development
export class MockPromptService implements IPromptService {
  async getPersonalizedPrompt(userId: string, context: any): Promise<PersonalizedPrompt> {
    // Get current context
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    if (hour < 12) timeOfDay = 'morning';
    else if (hour < 17) timeOfDay = 'afternoon';
    else if (hour < 21) timeOfDay = 'evening';
    else timeOfDay = 'night';

    // Find contextual prompts
    const contextualPrompts = getPromptsByContext({
      mood: context.mood,
      timeOfDay,
      dayOfWeek,
      keywords: context.recentKeywords
    });

    // Select a prompt (random from contextual or default)
    const selectedPrompt = contextualPrompts.length > 0
      ? contextualPrompts[Math.floor(Math.random() * contextualPrompts.length)]
      : defaultPrompts[Math.floor(Math.random() * defaultPrompts.length)];

    // Personalize the prompt text based on context
    let personalizedText = selectedPrompt.text;

    if (context.streakDays > 7) {
      personalizedText = `Great job on your ${context.streakDays}-day streak! ${personalizedText}`;
    } else if (context.previousEntries === 0) {
      personalizedText = `Welcome to your journaling journey! ${personalizedText}`;
    }

    return {
      promptId: selectedPrompt.id,
      userId,
      generatedText: personalizedText,
      context: {
        recentTopics: context.recentTopics || [],
        currentMood: context.mood || 'neutral',
        writingPattern: context.writingPattern || 'regular',
        previousEntries: context.previousEntries || 0,
        streakDays: context.streakDays || 0
      },
      effectiveness: 0.8, // Default high effectiveness
      skipped: false
    };
  }

  async generateFollowUp(prompt: ReflectivePrompt, response: string): Promise<string> {
    // Simple follow-up selection based on response length
    const wordCount = response.split(/\s+/).length;

    if (wordCount < 20) {
      return "That's a good start. Can you tell me more about that?";
    }

    // Return a random follow-up question from the prompt
    if (prompt.followUpQuestions.length > 0) {
      return prompt.followUpQuestions[Math.floor(Math.random() * prompt.followUpQuestions.length)];
    }

    return "Thank you for sharing. How does reflecting on this make you feel?";
  }

  async analyzePromptEffectiveness(userId: string): Promise<PromptInsight[]> {
    // Mock insights
    return [
      {
        userId,
        promptCategory: 'gratitude',
        averageEffectiveness: 0.85,
        totalResponses: 15,
        averageWordCount: 150,
        preferredTime: 'evening',
        insights: [
          'You respond most thoughtfully to gratitude prompts in the evening',
          'Your gratitude entries tend to be 30% longer than average'
        ]
      },
      {
        userId,
        promptCategory: 'growth',
        averageEffectiveness: 0.75,
        totalResponses: 10,
        averageWordCount: 200,
        preferredTime: 'morning',
        insights: [
          'Growth-focused prompts inspire your longest entries',
          'You often set actionable goals in response to these prompts'
        ]
      }
    ];
  }

  async suggestNextPrompt(userId: string, recentEntries: JournalEntry[]): Promise<ReflectivePrompt> {
    // Extract context from recent entries
    const latestEntry = recentEntries[0];
    const mood = latestEntry?.mood;

    // Get contextual prompts
    const contextualPrompts = getPromptsByContext({ mood });
    const candidatePool = contextualPrompts.length > 0 ? contextualPrompts : defaultPrompts;

    // Return a random prompt from the pool
    return candidatePool[Math.floor(Math.random() * candidatePool.length)];
  }

  async suggestMultiplePrompts(userId: string, recentEntries: JournalEntry[]): Promise<ReflectivePrompt[]> {
    // Extract context from recent entries
    const latestEntry = recentEntries[0];
    const mood = latestEntry?.mood;

    // Get contextual prompts
    const contextualPrompts = getPromptsByContext({ mood });
    const candidatePool = contextualPrompts.length > 0 ? contextualPrompts : defaultPrompts;

    // Get 2-3 random prompts
    const numPrompts = Math.min(3, candidatePool.length);
    const shuffled = [...candidatePool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, numPrompts);
  }
}

// Export singleton instance - use mock for now
export const promptService = new MockPromptService();
