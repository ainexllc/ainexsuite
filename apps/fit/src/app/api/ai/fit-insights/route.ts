import { NextRequest, NextResponse } from 'next/server';
import { getOpenRouterClient } from '@/lib/ai';

interface WorkoutPayload {
  title: string;
  date: string;
  duration: number;
  exercises: {
    name: string;
    sets: number;
    totalReps: number;
    totalWeight: number;
  }[];
  feeling?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workouts } = body as { workouts: WorkoutPayload[] };

    if (!workouts || !Array.isArray(workouts) || workouts.length === 0) {
      return NextResponse.json(
        { error: 'No workouts provided to analyze' },
        { status: 400 }
      );
    }

    const client = getOpenRouterClient();

    const workoutsContext = workouts
      .map(
        (w, i) =>
          `Workout ${i + 1} (${w.date}): "${w.title}" - ${w.duration}min, ${w.exercises.length} exercises [${w.exercises
            .map((e) => `${e.name}: ${e.sets} sets, ${e.totalReps} reps`)
            .join('; ')}]${w.feeling ? ` - Felt: ${w.feeling}` : ''}`
      )
      .join('\n');

    const prompt = `Analyze the following recent workout data and provide fitness coaching insights.

${workoutsContext}

Return ONLY a valid JSON object with this structure:
{
  "weeklyProgress": "A 1-2 sentence summary of training progress and patterns.",
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
  "nextWorkoutSuggestion": "A specific suggestion for the next workout based on patterns."
}

- "weeklyProgress": Summarize workout frequency, volume trends, and consistency.
- "recommendations": Provide 2-3 actionable tips to improve training (recovery, exercise selection, progression).
- "nextWorkoutSuggestion": Based on recent workouts, suggest what to focus on next (muscle groups, rest day, etc.).
`;

    const completion = await client.createCompletion({
      messages: [
        {
          role: 'system',
          content:
            'You are an expert fitness coach AI. You speak only valid JSON. Do not include markdown formatting or explanations.',
        },
        { role: 'user', content: prompt },
      ],
      model: 'grok-4-1-fast-non-reasoning',
      temperature: 0.3,
    });

    const responseContent = completion.choices[0]?.message?.content || '{}';

    let jsonStr = responseContent;
    const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    let data;
    try {
      data = JSON.parse(jsonStr);
    } catch {
      console.error('Failed to parse AI response:', responseContent);
      return NextResponse.json({
        weeklyProgress: 'Could not analyze workouts at this time.',
        recommendations: [],
        nextWorkoutSuggestion: 'Continue with your regular training schedule.',
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Fit Insights Error:', error);
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json({ error: 'AI configuration missing (API Key).' }, { status: 500 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}
