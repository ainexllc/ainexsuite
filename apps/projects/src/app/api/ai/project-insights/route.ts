import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

interface ProjectData {
  name: string;
  status: string;
  priority: string;
  dueDate?: string;
  description?: string;
}

const SYSTEM_PROMPT = `You are a project management advisor. Analyze the provided project data and return actionable insights in JSON format.

Return ONLY valid JSON with this exact structure (no markdown, no code blocks, just raw JSON):
{
  "portfolioHealth": "One sentence summary of overall project portfolio health",
  "focusArea": "The most critical project or area requiring immediate attention",
  "riskAlerts": ["Risk 1", "Risk 2"],
  "recommendations": ["Actionable tip 1", "Actionable tip 2", "Actionable tip 3"],
  "productivityTip": "One specific suggestion to improve project execution",
  "upcomingDeadlines": "Summary of approaching deadlines"
}

Guidelines:
- portfolioHealth: Overall assessment considering status distribution and priorities
- focusArea: Identify the most urgent or important project needing attention
- riskAlerts: Flag any concerning patterns (overdue, too many active, blocked projects)
- recommendations: 3 specific, actionable improvements
- productivityTip: One clear productivity enhancement
- upcomingDeadlines: Mention any projects with near-term due dates

Be constructive and actionable. Focus on helping the user prioritize effectively.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projects } = body as { projects: ProjectData[] };

    if (!projects || !Array.isArray(projects) || projects.length === 0) {
      return NextResponse.json(
        { error: "No project data provided to analyze" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI API key is missing (GROK_API_KEY)" },
        { status: 500 }
      );
    }

    // Format projects for the AI
    const projectsText = projects
      .map(
        (p, i) =>
          `Project ${i + 1}: ${p.name} - Status: ${p.status}, Priority: ${p.priority}${p.dueDate ? `, Due: ${p.dueDate}` : ""}${p.description ? ` - ${p.description.slice(0, 100)}` : ""}`
      )
      .join("\n");

    const userMessage = `Please analyze this project portfolio and provide insights:

PROJECTS (${projects.length} total):
${projectsText}`;

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4-1-fast-non-reasoning",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.5,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("xAI API Error:", errorText);
      return NextResponse.json(
        { error: "Failed to generate project insights" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "";

    // Parse the JSON response from AI
    let insights;
    try {
      let jsonStr = aiResponse;

      // Remove markdown code blocks if present
      const codeBlockMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1].trim();
      } else {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonStr = jsonMatch[0];
        }
      }

      insights = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response:", aiResponse);
      // Return fallback insights
      insights = {
        portfolioHealth: "Your project portfolio is taking shape!",
        focusArea: "Review your highest priority projects first",
        riskAlerts: [],
        recommendations: [
          "Set clear deadlines for all projects",
          "Review project priorities weekly",
          "Break large projects into milestones",
        ],
        productivityTip: "Focus on one project at a time for better results",
        upcomingDeadlines: "Check your calendar for upcoming deadlines",
      };
    }

    // Validate and ensure proper structure
    return NextResponse.json({
      portfolioHealth: insights.portfolioHealth || "Portfolio looking good!",
      focusArea: insights.focusArea || "",
      riskAlerts: Array.isArray(insights.riskAlerts)
        ? insights.riskAlerts.slice(0, 3)
        : [],
      recommendations: Array.isArray(insights.recommendations)
        ? insights.recommendations.slice(0, 5)
        : [],
      productivityTip: insights.productivityTip || "",
      upcomingDeadlines: insights.upcomingDeadlines || "",
    });
  } catch (error) {
    console.error("Project Insights Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    );
  }
}
