/**
 * Prompt Library Types
 * For AI-powered writing prompts and guided journaling
 */

export interface ReflectivePrompt {
  id: string;
  text: string;
  category: 'gratitude' | 'growth' | 'challenge' | 'creativity' | 'relationship' | 'reflection' | 'mindfulness';
  contextTriggers: {
    mood?: string;
    keywords?: string[];
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
    dayOfWeek?: number;
    weather?: string;
    season?: 'spring' | 'summer' | 'fall' | 'winter';
  };
  followUpQuestions: string[];
  tags: string[];
  difficulty: 'easy' | 'medium' | 'deep';
  estimatedTime: number; // in minutes
  contextNote?: string;
}

export interface PersonalizedPrompt {
  promptId: string;
  userId: string;
  generatedText: string;
  context: {
    recentTopics: string[];
    currentMood: string;
    writingPattern: string;
    previousEntries: number;
    streakDays: number;
  };
  effectiveness: number; // 0-1
  usedAt?: Date;
  skipped: boolean;
  completionTime?: number; // in seconds
}

export interface PromptResponse {
  promptId: string;
  userId: string;
  entryId?: string;
  response: string;
  sentiment: number;
  wordCount: number;
  respondedAt: Date;
  helpful: boolean | null;
}

export interface PromptInsight {
  userId: string;
  promptCategory: string;
  averageEffectiveness: number;
  totalResponses: number;
  averageWordCount: number;
  preferredTime: string;
  insights: string[];
}

export interface DailyPrompt {
  id: string;
  userId: string;
  prompt: ReflectivePrompt;
  scheduledFor: Date;
  delivered: boolean;
  deliveredAt?: Date;
  opened: boolean;
  openedAt?: Date;
  completed: boolean;
  completedAt?: Date;
}

export interface PromptLibraryEntry {
  id: string;
  text: string;
  tags: string[];
  tone?: string;
  audience?: 'morning' | 'evening' | 'weekend' | 'general';
  createdAt?: Date;
}
