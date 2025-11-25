import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entries } = body as { entries: { title: string; content: string; date: string; mood?: string }[] };

    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json(
        { error: "No recent entries provided to analyze" },
        { status: 400 }
      );
    }

    // Proxy to Notes API (running on localhost:3001) to use its configured AI client
    // This ensures we use the exact same model and configuration as Notes
    try {
        const notesResponse = await fetch('http://localhost:3001/api/ai/workspace-insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            notes: entries.map((e) => ({
              title: e.title,
              content: `[Mood: ${e.mood || 'Unknown'}] ${e.content}`,
              date: e.date
            }))
          })
        });

        if (notesResponse.ok) {
           const data = await notesResponse.json();
           // Map Notes format to Journey format
           return NextResponse.json({
             weeklyVibe: data.weeklyFocus,
             recurringThemes: data.commonThemes,
             reflectionPrompts: data.pendingActions // Notes returns 'pendingActions', we map to prompts
           });
        }
        
        // If Notes API fails (e.g. app not running), fall through to error
        console.error("Notes API Proxy failed:", await notesResponse.text());
    } catch (proxyError) {
        console.error("Notes API Proxy connection failed:", proxyError);
        // If proxy fails, we throw to trigger the catch block below
        throw new Error("Notes App (localhost:3001) is not reachable or failed.");
    }

    throw new Error("Unexpected flow");

  } catch (error) {
    console.error("Journal Insights Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    );
  }
}
