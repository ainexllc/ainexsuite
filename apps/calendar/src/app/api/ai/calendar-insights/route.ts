import { NextRequest, NextResponse } from "next/server";
import { getGrokClient } from "@/lib/ai";

interface CalendarEventInput {
  title: string;
  type: string;
  startTime: string;
  endTime: string;
  allDay?: boolean;
  location?: string;
  description?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { events } = body as { events: CalendarEventInput[] };

    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: "No events provided to analyze" },
        { status: 400 }
      );
    }

    const client = getGrokClient();

    // Construct a prompt that includes event data
    const eventsContext = events.map((e, i) =>
      `Event ${i + 1}: [${e.type}] "${e.title}" on ${e.startTime}${e.allDay ? ' (all day)' : ` to ${e.endTime}`}${e.location ? ` at ${e.location}` : ''}`
    ).join("\n");

    const prompt = `Analyze the following calendar events from the past 2 weeks and upcoming 2 weeks, and provide comprehensive scheduling insights.

${eventsContext}

Return ONLY a valid JSON object with this structure:
{
  "weeklyOverview": "A 1-sentence summary of how busy or free the schedule looks.",
  "busiestDay": "The busiest day and why (e.g., 'Wednesday - 5 events including back-to-back meetings').",
  "freeTimeBlocks": ["Monday afternoon", "Friday morning"],
  "meetingLoad": "increasing",
  "scheduleBalance": 75,
  "topEventTypes": [{"type": "Meeting", "count": 8}],
  "suggestedFocusTime": "Tuesday 2-5pm appears free for deep work.",
  "overcommitmentWarning": null,
  "quickTip": "One actionable scheduling suggestion."
}

Field descriptions:
- "weeklyOverview": High-level assessment of schedule density.
- "busiestDay": Identify the most packed day with specific reasoning.
- "freeTimeBlocks": Up to 3 time blocks that appear free for scheduling (max 3).
- "meetingLoad": One of: "increasing", "stable", "decreasing", "light" - trend assessment.
- "scheduleBalance": Score 0-100 representing work-life balance (100 = perfectly balanced).
- "topEventTypes": Top 2-3 event types by frequency.
- "suggestedFocusTime": Recommend a specific time block for focused work.
- "overcommitmentWarning": If schedule is very full, provide a warning message. Otherwise null.
- "quickTip": One actionable productivity tip based on the schedule.
`;

    const completion = await client.createCompletion({
      messages: [
        { role: "system", content: "You are a personal productivity assistant specialized in calendar analysis. You speak only valid JSON. Do not include markdown formatting or explanations." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
    });

    const responseContent = completion.choices[0]?.message?.content || "{}";

    // Robust JSON extraction
    let jsonStr = responseContent;
    const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    let data;
    try {
      data = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", responseContent);
      // Return a safe fallback
      return NextResponse.json({
        weeklyOverview: "Could not analyze calendar at this time.",
        busiestDay: null,
        freeTimeBlocks: [],
        meetingLoad: "stable",
        scheduleBalance: 50,
        topEventTypes: [],
        suggestedFocusTime: null,
        overcommitmentWarning: null,
        quickTip: ""
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Calendar Insights Error:", error);
    if (error instanceof Error && error.message.includes("GROK_API_KEY")) {
      return NextResponse.json(
        { error: "AI configuration missing (API Key)." },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    );
  }
}
