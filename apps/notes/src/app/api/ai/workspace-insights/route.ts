import { NextRequest, NextResponse } from "next/server";
import { getOpenRouterClient } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { notes } = body as { notes: { title: string; content: string; date: string }[] };

    if (!notes || !Array.isArray(notes) || notes.length === 0) {
      return NextResponse.json(
        { error: "No recent notes provided to analyze" },
        { status: 400 }
      );
    }

    const client = getOpenRouterClient();
    
    // Construct a prompt that includes brief content from the notes
    const notesContext = notes.map((n, i) => 
      `Note ${i + 1} (${n.date}): [${n.title || "Untitled"}] ${n.content.slice(0, 300)}...`
    ).join("\n\n");

    const prompt = `Analyze the following recent notes from my workspace and provide high-level insights.
    
${notesContext}

Return ONLY a valid JSON object with this structure:
{
  "weeklyFocus": "A 1-sentence summary of what I seem to be working on recently.",
  "commonThemes": ["Theme 1", "Theme 2", "Theme 3"],
  "pendingActions": ["Critical task 1", "Critical task 2", "Critical task 3"]
}

- "weeklyFocus": Synthesize the main topic or project.
- "commonThemes": Identify recurring subjects (e.g., "House Renovation", "Q4 Planning").
- "pendingActions": Extract up to 3 most important uncompleted tasks or reminders found in the text.
`;

    // Use createCompletion for better control (lower temperature for JSON stability)
    const completion = await client.createCompletion({
      messages: [
        { role: "system", content: "You are a personal productivity assistant. You speak only valid JSON. Do not include markdown formatting or explanations." },
        { role: "user", content: prompt }
      ],
      model: "openai/gpt-3.5-turbo", // Fast and reliable
      temperature: 0.3, // Lower temperature for deterministic output
    });

    const responseContent = completion.choices[0]?.message?.content || "{}";

    // Robust JSON extraction
    let jsonStr = responseContent;
    // Try to find JSON object within the response (handles markdown blocks and extra text)
    const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    let data;
    try {
      data = JSON.parse(jsonStr);
    } catch (parseError) {
       console.error("Failed to parse AI response:", responseContent);
       // Return a safe fallback instead of 500 to prevent UI crash/error state loop
       return NextResponse.json({
         weeklyFocus: "Could not analyze notes at this time.",
         commonThemes: [],
         pendingActions: []
       });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Workspace Insights Error:", error);
    // Check for missing API key specific error
    if (error instanceof Error && error.message.includes("OPENROUTER_API_KEY")) {
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
