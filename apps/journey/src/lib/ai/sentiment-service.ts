import {
  SentimentAnalysis,
  EmotionalTrend,
  SentimentInsight,
  SentimentMetrics,
  JournalEntry
} from '@ainexsuite/types';

export interface ISentimentService {
  analyzeEntry(entry: JournalEntry): Promise<SentimentAnalysis>;
  getEmotionalTrends(userId: string, period: 'daily' | 'weekly' | 'monthly' | 'yearly'): Promise<EmotionalTrend[]>;
  generateInsights(userId: string): Promise<SentimentInsight[]>;
  getMetrics(userId: string): Promise<SentimentMetrics>;
}

// Mock implementation for development
export class MockSentimentService implements ISentimentService {
  async analyzeEntry(entry: JournalEntry): Promise<SentimentAnalysis> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simple keyword-based analysis for development
    const content = entry.content.toLowerCase();
    const title = entry.title.toLowerCase();
    const fullText = `${title} ${content}`;

    // Define emotion keywords
    const emotionKeywords = {
      joy: ['happy', 'joy', 'excited', 'wonderful', 'amazing', 'great', 'fantastic', 'love', 'beautiful', 'grateful'],
      sadness: ['sad', 'depressed', 'lonely', 'miss', 'lost', 'grief', 'heartbroken', 'cry', 'tears'],
      anger: ['angry', 'mad', 'frustrated', 'annoyed', 'hate', 'furious', 'rage', 'upset'],
      fear: ['afraid', 'scared', 'anxious', 'worried', 'nervous', 'panic', 'terrified', 'stress'],
      surprise: ['surprised', 'shocked', 'unexpected', 'sudden', 'amazing', 'unbelievable', 'wow'],
      love: ['love', 'care', 'affection', 'dear', 'beloved', 'cherish', 'adore', 'romantic']
    };

    // Calculate emotion scores
    const emotions: any = {};
    let totalEmotionScore = 0;

    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      const score = keywords.reduce((sum, keyword) => {
        const matches = (fullText.match(new RegExp(keyword, 'gi')) || []).length;
        return sum + matches;
      }, 0);
      emotions[emotion] = score;
      totalEmotionScore += score;
    }

    // Normalize emotion scores to 0-1 range
    if (totalEmotionScore > 0) {
      for (const emotion in emotions) {
        emotions[emotion] = emotions[emotion] / totalEmotionScore;
      }
    } else {
      // Default neutral emotions
      for (const emotion in emotions) {
        emotions[emotion] = 1 / Object.keys(emotions).length;
      }
    }

    // Calculate overall sentiment
    const positiveScore = emotions.joy + emotions.love + emotions.surprise * 0.5;
    const negativeScore = emotions.sadness + emotions.anger + emotions.fear;
    const sentimentScore = Math.max(-1, Math.min(1, positiveScore - negativeScore));

    // Determine sentiment category
    let sentiment: SentimentAnalysis['sentiment'];
    if (sentimentScore > 0.3) sentiment = 'positive';
    else if (sentimentScore < -0.3) sentiment = 'negative';
    else if (Math.abs(positiveScore - negativeScore) < 0.1) sentiment = 'neutral';
    else sentiment = 'mixed';

    // Extract keywords (simple approach - most common words)
    const words = fullText.split(/\W+/).filter(word => word.length > 4);
    const wordFreq: { [key: string]: number } = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    const keywords = Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);

    // Extract themes based on common topics
    const themes: string[] = [];
    if (fullText.includes('work') || fullText.includes('job')) themes.push('career');
    if (fullText.includes('family') || fullText.includes('parents')) themes.push('family');
    if (fullText.includes('friend')) themes.push('relationships');
    if (fullText.includes('health') || fullText.includes('exercise')) themes.push('health');
    if (fullText.includes('goal') || fullText.includes('achieve')) themes.push('personal-growth');

    return {
      entryId: entry.id,
      userId: entry.ownerId,
      sentiment,
      sentimentScore,
      emotions,
      keywords,
      themes,
      analyzedAt: new Date()
    };
  }

  async getEmotionalTrends(userId: string, period: 'daily' | 'weekly' | 'monthly' | 'yearly'): Promise<EmotionalTrend[]> {
    // Mock implementation - return sample trends
    await new Promise(resolve => setTimeout(resolve, 300));

    const now = new Date();
    const trends: EmotionalTrend[] = [];

    // Generate sample trends for the last 7 periods
    for (let i = 6; i >= 0; i--) {
      const startDate = new Date(now.getTime());
      const endDate = new Date(now.getTime());

      switch (period) {
        case 'daily':
          startDate.setDate(startDate.getDate() - i);
          endDate.setDate(endDate.getDate() - i);
          startDate.setMilliseconds(i);
          endDate.setMilliseconds(i);
          break;
        case 'weekly':
          startDate.setDate(startDate.getDate() - (i * 7));
          endDate.setDate(endDate.getDate() - (i * 7) + 6);
          startDate.setMilliseconds(i);
          endDate.setMilliseconds(i);
          break;
        case 'monthly':
          startDate.setMonth(startDate.getMonth() - i);
          endDate.setMonth(endDate.getMonth() - i + 1);
          endDate.setDate(0);
          startDate.setMilliseconds(i);
          endDate.setMilliseconds(i);
          break;
        case 'yearly':
          startDate.setFullYear(startDate.getFullYear() - i);
          endDate.setFullYear(endDate.getFullYear() - i);
          endDate.setMonth(11, 31);
          startDate.setMilliseconds(i);
          endDate.setMilliseconds(i);
          break;
      }

      const emotions = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'love'];
      const dominantEmotion = emotions[Math.floor(Math.random() * emotions.length)];

      const emotionBreakdown: { [key: string]: number } = {};
      let remaining = 100;
      emotions.forEach((emotion, index) => {
        if (index === emotions.length - 1) {
          emotionBreakdown[emotion] = remaining;
        } else {
          const value = Math.floor(Math.random() * remaining * 0.5);
          emotionBreakdown[emotion] = value;
          remaining -= value;
        }
      });

      trends.push({
        period,
        startDate,
        endDate,
        averageSentiment: Math.random() * 2 - 1,
        dominantEmotion,
        emotionBreakdown,
        insights: [
          `Your ${dominantEmotion} levels were higher than usual during this period.`,
          'Writing frequency increased by 20% compared to the previous period.'
        ]
      });
    }

    return trends;
  }

  async generateInsights(userId: string): Promise<SentimentInsight[]> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const insights: SentimentInsight[] = [
      {
        id: '1',
        userId,
        type: 'pattern',
        title: 'Positive Mood Pattern Detected',
        description: 'Your mood tends to be more positive on weekends. Consider scheduling important activities during these times.',
        createdAt: new Date(),
        read: false,
        priority: 'medium'
      },
      {
        id: '2',
        userId,
        type: 'achievement',
        title: 'Emotional Growth Milestone',
        description: 'You\'ve shown a 15% improvement in emotional resilience over the past month!',
        createdAt: new Date(),
        read: false,
        priority: 'high'
      },
      {
        id: '3',
        userId,
        type: 'suggestion',
        title: 'Try Morning Journaling',
        description: 'Based on your patterns, journaling in the morning might help you start your day with more clarity.',
        createdAt: new Date(),
        read: false,
        priority: 'low'
      }
    ];

    return insights;
  }

  async getMetrics(userId: string): Promise<SentimentMetrics> {
    await new Promise(resolve => setTimeout(resolve, 200));

    return {
      userId,
      totalEntries: 50,
      analyzedEntries: 45,
      overallSentiment: 0.3,
      emotionalVolatility: 0.4,
      emotionalGrowth: 0.15,
      lastAnalyzedAt: new Date(),
      correlations: [
        {
          factor: 'timeOfDay',
          correlation: 0.6,
          sampleSize: 45,
          confidence: 0.8
        },
        {
          factor: 'dayOfWeek',
          correlation: 0.4,
          sampleSize: 45,
          confidence: 0.7
        }
      ]
    };
  }
}

// Export singleton instance - use mock for now
export const sentimentService = new MockSentimentService();
