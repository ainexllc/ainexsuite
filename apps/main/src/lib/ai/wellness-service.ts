/**
 * Wellness Insights Service
 *
 * Analyzes emotional patterns in note content over time using Gemini AI.
 * Helps users understand their emotional patterns and provides supportive recommendations.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { listNotes, type Note } from './notes-service';
import { getProductivityInsights, getWeeklyDigest } from './analytics-service';

// ============================================
// TYPES
// ============================================

export type EmotionType =
  | 'joy'
  | 'gratitude'
  | 'excitement'
  | 'calm'
  | 'sadness'
  | 'anxiety'
  | 'frustration'
  | 'stress'
  | 'neutral';

export type TrendDirection = 'improving' | 'declining' | 'stable';

export interface MoodDataPoint {
  date: string;
  sentiment: number; // -1 to 1 scale
  dominantEmotion: EmotionType;
  noteCount: number;
}

export interface MoodTrendsResult {
  trends: MoodDataPoint[];
  overallTrend: TrendDirection;
  insights: string[];
  periodSummary: string;
}

export interface EmotionalInsightsResult {
  currentMood: {
    sentiment: number;
    description: string;
  };
  dominantEmotions: Array<{
    emotion: EmotionType;
    percentage: number;
    description: string;
  }>;
  triggers: Array<{
    topic: string;
    emotionalImpact: 'positive' | 'negative' | 'neutral';
    frequency: number;
  }>;
  positiveTopics: string[];
  suggestions: string[];
}

export interface WellnessRecommendation {
  type: 'reflection' | 'activity' | 'habit' | 'mindfulness' | 'connection';
  suggestion: string;
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
}

export interface WellnessRecommendationsResult {
  recommendations: WellnessRecommendation[];
  streakInfo: {
    currentStreak: number;
    longestStreak: number;
    isActive: boolean;
  };
  encouragement: string;
  wellnessScore: number; // 0-100
}

// ============================================
// AI CLIENT
// ============================================

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

function getGeminiClient() {
  if (!apiKey) {
    throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not configured');
  }
  return new GoogleGenerativeAI(apiKey);
}

// ============================================
// EMOTION KEYWORDS
// ============================================

const EMOTION_KEYWORDS: Record<EmotionType, string[]> = {
  joy: [
    'happy',
    'joy',
    'joyful',
    'delighted',
    'thrilled',
    'wonderful',
    'amazing',
    'fantastic',
    'great',
    'awesome',
    'love',
    'loved',
    'beautiful',
    'celebrate',
    'fun',
    'laugh',
    'smile',
    'blessed',
  ],
  gratitude: [
    'grateful',
    'thankful',
    'appreciate',
    'appreciation',
    'blessed',
    'fortunate',
    'lucky',
    'thanks',
    'thank',
  ],
  excitement: [
    'excited',
    'exciting',
    'eager',
    'thrilled',
    'pumped',
    'stoked',
    'enthusiastic',
    'looking forward',
    'can\'t wait',
    'anticipate',
  ],
  calm: [
    'calm',
    'peaceful',
    'relaxed',
    'serene',
    'tranquil',
    'content',
    'at ease',
    'comfortable',
    'settled',
    'centered',
    'mindful',
  ],
  sadness: [
    'sad',
    'unhappy',
    'depressed',
    'down',
    'blue',
    'lonely',
    'miss',
    'missing',
    'lost',
    'grief',
    'heartbroken',
    'cry',
    'tears',
    'disappointed',
  ],
  anxiety: [
    'anxious',
    'worried',
    'nervous',
    'uneasy',
    'restless',
    'panic',
    'fear',
    'afraid',
    'scared',
    'uncertain',
    'overwhelmed',
    'dread',
  ],
  frustration: [
    'frustrated',
    'annoyed',
    'irritated',
    'angry',
    'mad',
    'upset',
    'furious',
    'rage',
    'hate',
    'ugh',
    'stuck',
    'blocked',
  ],
  stress: [
    'stressed',
    'stress',
    'pressure',
    'overworked',
    'exhausted',
    'burned out',
    'burnout',
    'tired',
    'drained',
    'overwhelmed',
    'deadline',
    'rush',
    'busy',
  ],
  neutral: [],
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Extract text content from a note (title + body + checklist items)
 */
function extractNoteContent(note: Note): string {
  const parts = [note.title, note.body];

  if (note.checklist && note.checklist.length > 0) {
    const checklistText = note.checklist.map((item) => item.text).join(' ');
    parts.push(checklistText);
  }

  return parts.filter(Boolean).join(' ');
}

/**
 * Basic keyword-based emotion detection (used as fallback and for quick analysis)
 */
function detectEmotionsFromText(text: string): Record<EmotionType, number> {
  const lowerText = text.toLowerCase();
  const scores: Record<EmotionType, number> = {
    joy: 0,
    gratitude: 0,
    excitement: 0,
    calm: 0,
    sadness: 0,
    anxiety: 0,
    frustration: 0,
    stress: 0,
    neutral: 0,
  };

  let totalMatches = 0;

  for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
    if (emotion === 'neutral') continue;

    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = (lowerText.match(regex) || []).length;
      scores[emotion as EmotionType] += matches;
      totalMatches += matches;
    }
  }

  // Normalize scores
  if (totalMatches > 0) {
    for (const emotion of Object.keys(scores) as EmotionType[]) {
      scores[emotion] = scores[emotion] / totalMatches;
    }
  } else {
    // Default to neutral if no emotional keywords found
    scores.neutral = 1;
  }

  return scores;
}

/**
 * Calculate sentiment score from emotion scores
 */
function calculateSentiment(emotions: Record<EmotionType, number>): number {
  const positiveEmotions = ['joy', 'gratitude', 'excitement', 'calm'] as EmotionType[];
  const negativeEmotions = ['sadness', 'anxiety', 'frustration', 'stress'] as EmotionType[];

  let positive = 0;
  let negative = 0;

  for (const emotion of positiveEmotions) {
    positive += emotions[emotion];
  }
  for (const emotion of negativeEmotions) {
    negative += emotions[emotion];
  }

  // Return value between -1 and 1
  return Math.max(-1, Math.min(1, positive - negative));
}

/**
 * Get the dominant emotion from scores
 */
function getDominantEmotion(emotions: Record<EmotionType, number>): EmotionType {
  let maxEmotion: EmotionType = 'neutral';
  let maxScore = 0;

  for (const [emotion, score] of Object.entries(emotions)) {
    if (score > maxScore) {
      maxScore = score;
      maxEmotion = emotion as EmotionType;
    }
  }

  return maxEmotion;
}

/**
 * Get date string in YYYY-MM-DD format
 */
function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get period start date based on period type
 */
function getPeriodStartDate(period: 'week' | 'month' | 'quarter'): Date {
  const now = new Date();
  const result = new Date(now);

  switch (period) {
    case 'week':
      result.setDate(now.getDate() - 7);
      break;
    case 'month':
      result.setDate(now.getDate() - 30);
      break;
    case 'quarter':
      result.setDate(now.getDate() - 90);
      break;
  }

  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Group notes by date
 */
function groupNotesByDate(notes: Note[]): Map<string, Note[]> {
  const grouped = new Map<string, Note[]>();

  for (const note of notes) {
    const dateStr = getDateString(note.createdAt);
    const existing = grouped.get(dateStr) || [];
    existing.push(note);
    grouped.set(dateStr, existing);
  }

  return grouped;
}

// ============================================
// MAIN SERVICE FUNCTIONS
// ============================================

/**
 * Analyze emotional trends over time
 *
 * @param userId - User ID
 * @param period - Time period to analyze ('week', 'month', 'quarter')
 * @param spaceId - Optional space ID to filter notes
 * @returns Mood trends with insights
 */
export async function getMoodTrends(
  userId: string,
  period: 'week' | 'month' | 'quarter',
  spaceId?: string
): Promise<MoodTrendsResult> {
  // Fetch notes for the period
  const limitCount = period === 'week' ? 50 : period === 'month' ? 100 : 200;
  const notes = await listNotes(userId, limitCount, spaceId);

  // Filter notes by period
  const periodStart = getPeriodStartDate(period);
  const periodNotes = notes.filter((note) => note.createdAt >= periodStart);

  // Group notes by date
  const notesByDate = groupNotesByDate(periodNotes);

  // Calculate trends for each date
  const trends: MoodDataPoint[] = [];
  const sortedDates = Array.from(notesByDate.keys()).sort();

  for (const dateStr of sortedDates) {
    const dayNotes = notesByDate.get(dateStr) || [];

    // Combine all note content for the day
    const combinedContent = dayNotes.map(extractNoteContent).join(' ');

    // Detect emotions
    const emotions = detectEmotionsFromText(combinedContent);
    const sentiment = calculateSentiment(emotions);
    const dominantEmotion = getDominantEmotion(emotions);

    trends.push({
      date: dateStr,
      sentiment,
      dominantEmotion,
      noteCount: dayNotes.length,
    });
  }

  // Calculate overall trend
  let overallTrend: TrendDirection = 'stable';

  if (trends.length >= 3) {
    const firstHalf = trends.slice(0, Math.floor(trends.length / 2));
    const secondHalf = trends.slice(Math.floor(trends.length / 2));

    const firstAvg =
      firstHalf.reduce((sum, t) => sum + t.sentiment, 0) / firstHalf.length;
    const secondAvg =
      secondHalf.reduce((sum, t) => sum + t.sentiment, 0) / secondHalf.length;

    const diff = secondAvg - firstAvg;
    if (diff > 0.1) {
      overallTrend = 'improving';
    } else if (diff < -0.1) {
      overallTrend = 'declining';
    }
  }

  // Generate insights using AI
  const insights = await generateMoodInsights(trends, overallTrend, period);

  // Generate period summary
  const periodSummary = generatePeriodSummary(trends, overallTrend, period);

  return {
    trends,
    overallTrend,
    insights,
    periodSummary,
  };
}

/**
 * Use Gemini to generate mood insights
 */
async function generateMoodInsights(
  trends: MoodDataPoint[],
  overallTrend: TrendDirection,
  period: string
): Promise<string[]> {
  if (trends.length === 0) {
    return [
      'No notes found for this period. Start writing to track your emotional patterns!',
    ];
  }

  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `Analyze this mood trend data and provide 2-3 brief, supportive insights (each 1-2 sentences max).

Mood data for the past ${period}:
${JSON.stringify(trends.slice(-7), null, 2)}

Overall trend: ${overallTrend}

Guidelines:
- Be warm, supportive, and constructive
- Focus on patterns you notice
- Suggest gentle, actionable observations
- Do NOT diagnose or provide medical advice
- Keep each insight brief and positive

Return ONLY a JSON array of insight strings, like:
["Insight 1", "Insight 2", "Insight 3"]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse JSON response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as string[];
    }

    // Fallback to basic insights
    return generateBasicInsights(trends, overallTrend);
  } catch (error) {
    console.error('Error generating mood insights with AI:', error);
    return generateBasicInsights(trends, overallTrend);
  }
}

/**
 * Generate basic insights without AI (fallback)
 */
function generateBasicInsights(
  trends: MoodDataPoint[],
  overallTrend: TrendDirection
): string[] {
  const insights: string[] = [];

  if (overallTrend === 'improving') {
    insights.push(
      'Your emotional well-being seems to be trending positively. Keep up the great work!'
    );
  } else if (overallTrend === 'declining') {
    insights.push(
      'You may be going through a challenging time. Remember that seeking support is a sign of strength.'
    );
  } else {
    insights.push(
      'Your emotional state has been relatively stable. Consistency can be a foundation for growth.'
    );
  }

  // Check for variety in emotions
  const uniqueEmotions = new Set(trends.map((t) => t.dominantEmotion));
  if (uniqueEmotions.size > 3) {
    insights.push(
      'You\'re experiencing a healthy range of emotions, which shows emotional awareness.'
    );
  }

  // Check activity level
  const avgNotes =
    trends.reduce((sum, t) => sum + t.noteCount, 0) / Math.max(1, trends.length);
  if (avgNotes >= 2) {
    insights.push(
      'You\'ve been actively journaling, which is excellent for self-reflection.'
    );
  }

  return insights;
}

/**
 * Generate a summary of the period
 */
function generatePeriodSummary(
  trends: MoodDataPoint[],
  overallTrend: TrendDirection,
  period: string
): string {
  if (trends.length === 0) {
    return `No notes were recorded during this ${period}.`;
  }

  const avgSentiment =
    trends.reduce((sum, t) => sum + t.sentiment, 0) / trends.length;
  const totalNotes = trends.reduce((sum, t) => sum + t.noteCount, 0);

  const sentimentWord =
    avgSentiment > 0.3
      ? 'positive'
      : avgSentiment < -0.3
        ? 'challenging'
        : 'balanced';
  const trendWord =
    overallTrend === 'improving'
      ? 'getting better'
      : overallTrend === 'declining'
        ? 'slightly declining'
        : 'staying consistent';

  return `Over the past ${period}, you've written ${totalNotes} notes. Your overall mood has been ${sentimentWord} and ${trendWord}.`;
}

/**
 * Get insights about emotional patterns
 *
 * @param userId - User ID
 * @param spaceId - Optional space ID to filter notes
 * @returns Emotional insights with suggestions
 */
export async function getEmotionalInsights(
  userId: string,
  spaceId?: string
): Promise<EmotionalInsightsResult> {
  // Fetch recent notes
  const notes = await listNotes(userId, 30, spaceId);

  if (notes.length === 0) {
    return {
      currentMood: {
        sentiment: 0,
        description: 'No recent notes to analyze',
      },
      dominantEmotions: [],
      triggers: [],
      positiveTopics: [],
      suggestions: [
        'Start writing notes to track your emotional patterns',
        'Try reflecting on your day through a quick note',
      ],
    };
  }

  // Analyze all notes for emotion distribution
  const combinedContent = notes.map(extractNoteContent).join(' ');
  const allEmotions = detectEmotionsFromText(combinedContent);

  // Get current mood from most recent notes (last 5)
  const recentNotes = notes.slice(0, 5);
  const recentContent = recentNotes.map(extractNoteContent).join(' ');
  const recentEmotions = detectEmotionsFromText(recentContent);
  const currentSentiment = calculateSentiment(recentEmotions);

  // Format dominant emotions
  const sortedEmotions = Object.entries(allEmotions)
    .filter(([emotion]) => emotion !== 'neutral')
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  const dominantEmotions = sortedEmotions.map(([emotion, score]) => ({
    emotion: emotion as EmotionType,
    percentage: Math.round(score * 100),
    description: getEmotionDescription(emotion as EmotionType, score),
  }));

  // Extract topics/triggers using AI
  const { triggers, positiveTopics, suggestions } = await analyzeTopicsWithAI(
    notes,
    currentSentiment,
    dominantEmotions
  );

  // Get mood description
  const moodDescription = getMoodDescription(currentSentiment);

  return {
    currentMood: {
      sentiment: currentSentiment,
      description: moodDescription,
    },
    dominantEmotions,
    triggers,
    positiveTopics,
    suggestions,
  };
}

/**
 * Get description for an emotion
 */
function getEmotionDescription(emotion: EmotionType, score: number): string {
  const intensity = score > 0.3 ? 'strongly' : score > 0.15 ? 'moderately' : 'slightly';

  const descriptions: Record<EmotionType, string> = {
    joy: 'experiencing happiness and positive feelings',
    gratitude: 'feeling thankful and appreciative',
    excitement: 'feeling enthusiastic and energized',
    calm: 'feeling peaceful and at ease',
    sadness: 'processing difficult emotions',
    anxiety: 'experiencing worry or concern',
    frustration: 'feeling challenged or stuck',
    stress: 'managing pressure and demands',
    neutral: 'in a balanced state',
  };

  return `You're ${intensity} ${descriptions[emotion]}`;
}

/**
 * Get description for overall mood
 */
function getMoodDescription(sentiment: number): string {
  if (sentiment > 0.5) return 'You seem to be in a great mood lately!';
  if (sentiment > 0.2) return 'You\'re generally feeling positive';
  if (sentiment > -0.2) return 'Your mood has been balanced and neutral';
  if (sentiment > -0.5) return 'You may be going through some challenges';
  return 'You seem to be experiencing a difficult time';
}

/**
 * Use AI to analyze topics and generate suggestions
 */
async function analyzeTopicsWithAI(
  notes: Note[],
  sentiment: number,
  dominantEmotions: Array<{ emotion: EmotionType; percentage: number }>
): Promise<{
  triggers: EmotionalInsightsResult['triggers'];
  positiveTopics: string[];
  suggestions: string[];
}> {
  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Prepare note summaries (limit content to avoid token limits)
    const noteSummaries = notes.slice(0, 20).map((note) => ({
      title: note.title,
      preview: extractNoteContent(note).slice(0, 200),
      date: getDateString(note.createdAt),
    }));

    const prompt = `Analyze these note titles and previews to identify emotional patterns.

Notes:
${JSON.stringify(noteSummaries, null, 2)}

Current sentiment: ${sentiment > 0 ? 'positive' : sentiment < 0 ? 'negative' : 'neutral'}
Dominant emotions: ${dominantEmotions.map((e) => e.emotion).join(', ')}

Provide analysis in this exact JSON format:
{
  "triggers": [
    {"topic": "work", "emotionalImpact": "negative", "frequency": 3},
    {"topic": "family", "emotionalImpact": "positive", "frequency": 2}
  ],
  "positiveTopics": ["hobbies", "achievements", "relationships"],
  "suggestions": [
    "Supportive suggestion 1",
    "Supportive suggestion 2",
    "Supportive suggestion 3"
  ]
}

Guidelines:
- Identify 2-4 topics that appear frequently
- Mark emotional impact based on context (positive/negative/neutral)
- Suggest 2-3 gentle, supportive recommendations
- Be encouraging and non-judgmental
- Do NOT provide medical or mental health diagnoses`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        triggers: parsed.triggers || [],
        positiveTopics: parsed.positiveTopics || [],
        suggestions: parsed.suggestions || [],
      };
    }

    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('Error analyzing topics with AI:', error);

    // Fallback to basic analysis
    return {
      triggers: [],
      positiveTopics: [],
      suggestions: generateFallbackSuggestions(sentiment),
    };
  }
}

/**
 * Generate fallback suggestions based on sentiment
 */
function generateFallbackSuggestions(sentiment: number): string[] {
  if (sentiment > 0.2) {
    return [
      'Keep doing what\'s working for you!',
      'Consider sharing your positivity with others',
      'Take a moment to appreciate your progress',
    ];
  } else if (sentiment < -0.2) {
    return [
      'Consider reaching out to someone you trust',
      'Small acts of self-care can make a big difference',
      'Remember that difficult times are temporary',
    ];
  }
  return [
    'Maintain your balanced approach',
    'Try exploring new activities or interests',
    'Reflect on what brings you joy',
  ];
}

/**
 * Get personalized wellness recommendations
 *
 * @param userId - User ID
 * @returns Wellness recommendations with encouragement
 */
export async function getWellnessRecommendations(
  userId: string
): Promise<WellnessRecommendationsResult> {
  // Get productivity insights for streak info
  const productivity = await getProductivityInsights(userId, 'month');
  const weeklyDigest = await getWeeklyDigest(userId);

  // Get emotional insights for context
  const emotionalInsights = await getEmotionalInsights(userId);

  // Calculate wellness score (0-100)
  const wellnessScore = calculateWellnessScore(
    emotionalInsights.currentMood.sentiment,
    productivity.writingStreak,
    productivity.checklistCompletionRate,
    weeklyDigest.notesCreated
  );

  // Generate recommendations using AI
  const recommendations = await generateWellnessRecommendations(
    emotionalInsights,
    productivity,
    weeklyDigest,
    wellnessScore
  );

  // Generate personalized encouragement
  const encouragement = generateEncouragement(
    wellnessScore,
    productivity.writingStreak,
    emotionalInsights.currentMood.sentiment
  );

  return {
    recommendations,
    streakInfo: {
      currentStreak: productivity.writingStreak,
      longestStreak: productivity.longestStreak,
      isActive: productivity.writingStreak > 0,
    },
    encouragement,
    wellnessScore,
  };
}

/**
 * Calculate overall wellness score
 */
function calculateWellnessScore(
  sentiment: number,
  streak: number,
  completionRate: number,
  weeklyNotes: number
): number {
  // Sentiment contribution (0-40 points)
  // Map from -1..1 to 0..40
  const sentimentScore = Math.round(((sentiment + 1) / 2) * 40);

  // Activity contribution (0-30 points)
  const activityScore = Math.min(30, streak * 3 + weeklyNotes * 2);

  // Completion contribution (0-30 points)
  const completionScore = Math.round((completionRate / 100) * 30);

  return Math.min(100, sentimentScore + activityScore + completionScore);
}

/**
 * Generate wellness recommendations using AI
 */
async function generateWellnessRecommendations(
  emotionalInsights: EmotionalInsightsResult,
  productivity: Awaited<ReturnType<typeof getProductivityInsights>>,
  weeklyDigest: Awaited<ReturnType<typeof getWeeklyDigest>>,
  wellnessScore: number
): Promise<WellnessRecommendation[]> {
  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `Generate personalized wellness recommendations based on this user data.

Current state:
- Wellness score: ${wellnessScore}/100
- Current mood: ${emotionalInsights.currentMood.description}
- Sentiment: ${emotionalInsights.currentMood.sentiment}
- Writing streak: ${productivity.writingStreak} days
- Tasks completed this week: ${weeklyDigest.tasksCompleted}
- Notes created this week: ${weeklyDigest.notesCreated}

Dominant emotions: ${emotionalInsights.dominantEmotions.map((e) => `${e.emotion} (${e.percentage}%)`).join(', ')}

Provide 3-4 supportive recommendations in this exact JSON format:
{
  "recommendations": [
    {
      "type": "reflection",
      "suggestion": "Brief, actionable suggestion",
      "reasoning": "Why this could help",
      "priority": "high"
    }
  ]
}

Types must be one of: reflection, activity, habit, mindfulness, connection
Priority must be: high, medium, or low

Guidelines:
- Be warm, supportive, and encouraging
- Focus on small, achievable actions
- Tailor suggestions to their emotional state
- Do NOT provide medical advice
- Prioritize self-care and connection`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return (parsed.recommendations || []) as WellnessRecommendation[];
    }

    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('Error generating wellness recommendations with AI:', error);

    // Fallback recommendations
    return generateFallbackRecommendations(
      emotionalInsights.currentMood.sentiment,
      productivity.writingStreak
    );
  }
}

/**
 * Generate fallback recommendations
 */
function generateFallbackRecommendations(
  sentiment: number,
  streak: number
): WellnessRecommendation[] {
  const recommendations: WellnessRecommendation[] = [];

  // Based on sentiment
  if (sentiment < 0) {
    recommendations.push({
      type: 'mindfulness',
      suggestion: 'Take 5 minutes for a breathing exercise',
      reasoning: 'Brief mindfulness can help reset your emotional state',
      priority: 'high',
    });
    recommendations.push({
      type: 'connection',
      suggestion: 'Reach out to someone who makes you smile',
      reasoning: 'Social connection is a powerful mood booster',
      priority: 'medium',
    });
  } else {
    recommendations.push({
      type: 'reflection',
      suggestion: 'Write about what\'s going well in your life',
      reasoning: 'Capturing positive moments reinforces well-being',
      priority: 'medium',
    });
  }

  // Based on streak
  if (streak === 0) {
    recommendations.push({
      type: 'habit',
      suggestion: 'Start a brief daily note routine',
      reasoning: 'Small consistent actions build powerful habits',
      priority: 'high',
    });
  } else if (streak > 7) {
    recommendations.push({
      type: 'activity',
      suggestion: 'Celebrate your writing streak!',
      reasoning: 'Acknowledging progress motivates continued growth',
      priority: 'low',
    });
  }

  // Universal recommendation
  recommendations.push({
    type: 'activity',
    suggestion: 'Take a short walk or stretch break',
    reasoning: 'Physical movement supports mental well-being',
    priority: 'medium',
  });

  return recommendations.slice(0, 4);
}

/**
 * Generate personalized encouragement message
 */
function generateEncouragement(
  wellnessScore: number,
  streak: number,
  sentiment: number
): string {
  if (wellnessScore >= 80) {
    return 'You\'re doing amazing! Your consistent effort shows in your positive outlook. Keep nurturing this wonderful momentum.';
  }

  if (wellnessScore >= 60) {
    if (streak > 5) {
      return `Your ${streak}-day writing streak shows real dedication. You're building great habits that support your well-being.`;
    }
    return 'You\'re on a good path. Small consistent steps lead to meaningful progress. Keep going!';
  }

  if (wellnessScore >= 40) {
    if (sentiment < 0) {
      return 'Remember that challenging times don\'t last forever. You\'re showing strength by continuing to reflect and grow.';
    }
    return 'You\'re making steady progress. Every note you write is a step toward understanding yourself better.';
  }

  // Lower wellness score
  return 'Thank you for taking time to check in with yourself. Self-awareness is the first step toward positive change. You\'ve got this.';
}
