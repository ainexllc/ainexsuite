import { NextRequest, NextResponse } from "next/server";
import { getGrokClient } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content } = body as { title: string; content: string };

    if (!content && !title) {
      return NextResponse.json(
        { error: "Content or title is required" },
        { status: 400 }
      );
    }

    const client = getGrokClient();
    const prompt = `Analyze the following note content and provide insights.
    
Title: ${title || "Untitled"}
Content: ${content || "(No content)"}

Return ONLY a valid JSON object with the following structure:
{
  "summary": "A 1-sentence summary of the note",
  "actionItems": ["Action item 1", "Action item 2", ...],
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4", "Tag5"]
}

- "summary": Brief and concise.
- "actionItems": Extract up to 3 potential tasks or actionable steps. If none, return an empty array.
- "tags": Suggest 3-5 relevant 1-word tags for categorization.
`;

    const systemPrompt = "You are a helpful AI assistant that analyzes notes and extracts structured insights. You only speak JSON.";

    const response = await client.ask(prompt, systemPrompt);

    // Attempt to parse JSON
    let data;
    try {
      // Clean up potential markdown code blocks if the model adds them
      const jsonStr = response.replace(/```json\n|\n```/g, "").replace(/```/g, "").trim();
      data = JSON.parse(jsonStr);
    } catch (parseError) {
        // Fallback if JSON parsing fails, though we instructed the model strictly
       console.error("Failed to parse AI response:", response);
       return NextResponse.json(
        { error: "Failed to generate valid insights" },
        { status: 500 }
       );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("AI Insights Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    );
  }
}
