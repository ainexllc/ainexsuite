/**
 * Sentiment Analysis Types
 * For AI-powered emotional analysis of journal entries
 */

export interface SentimentAnalysis {
  entryId: string;
  userId: string;
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  sentimentScore: number; // -1 to 1
  emotions: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
    love: number;
  };
  keywords: string[];
  themes: string[];
  analyzedAt: Date;
}

export interface EmotionalTrend {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  averageSentiment: number;
  dominantEmotion: string;
  emotionBreakdown: {
    [key: string]: number; // emotion name -> percentage
  };
  insights: string[];
  significantEvents?: string[];
}

export interface SentimentInsight {
  id: string;
  userId: string;
  type: 'pattern' | 'anomaly' | 'achievement' | 'suggestion';
  title: string;
  description: string;
  data?: Record<string, unknown>;
  createdAt: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface MoodCorrelation {
  factor: string; // e.g., 'timeOfDay', 'weather', 'dayOfWeek'
  correlation: number; // -1 to 1
  sampleSize: number;
  confidence: number; // 0 to 1
}

export interface SentimentMetrics {
  userId: string;
  totalEntries: number;
  analyzedEntries: number;
  overallSentiment: number;
  emotionalVolatility: number; // 0 to 1, how much emotions vary
  emotionalGrowth: number; // trend over time
  lastAnalyzedAt: Date;
  correlations: MoodCorrelation[];
}
