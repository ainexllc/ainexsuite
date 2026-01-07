import { NextRequest, NextResponse } from "next/server";
import { getOpenRouterClient } from "@/lib/ai";

interface WorkflowInput {
  title: string;
  description: string;
  nodeCount: number;
  nodeTypes: string[];
  edgeCount: number;
  date: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflows } = body as { workflows: WorkflowInput[] };

    if (!workflows || !Array.isArray(workflows) || workflows.length === 0) {
      return NextResponse.json(
        { error: "No recent workflows provided to analyze" },
        { status: 400 }
      );
    }

    const client = getOpenRouterClient();

    // Construct a prompt that includes workflow data
    const workflowsContext = workflows.map((w, i) =>
      `Workflow ${i + 1} (${w.date}): "${w.title || "Untitled"}" - ${w.description?.slice(0, 100) || "No description"} | Nodes: ${w.nodeCount}, Edges: ${w.edgeCount}, Types: [${w.nodeTypes.slice(0, 5).join(", ")}]`
    ).join("\n");

    const prompt = `Analyze the following workflows from my visual automation workspace and provide insights.

${workflowsContext}

Return ONLY a valid JSON object with this structure:
{
  "weeklyFocus": "A 1-sentence summary of the main type of workflows being built.",
  "commonPatterns": ["Pattern 1", "Pattern 2", "Pattern 3"],
  "optimizations": ["Optimization suggestion 1", "Optimization suggestion 2"],
  "complexity": "Assessment of workflow complexity and sophistication",
  "topWorkflowTypes": [{"name": "Type", "count": 3}],
  "automationPotential": "Suggestion for potential automations based on workflow patterns",
  "quickTip": "One actionable tip for improving workflows"
}

Field descriptions:
- "weeklyFocus": Main theme or purpose of the workflows (e.g., "Data processing pipelines", "Customer onboarding flows").
- "commonPatterns": Top 3 recurring patterns or node types (e.g., "Decision branches", "API integrations", "Loops").
- "optimizations": Up to 3 suggestions to improve workflow efficiency or reduce complexity.
- "complexity": Brief assessment (e.g., "Moderately complex with good structure", "Simple and efficient").
- "topWorkflowTypes": Categories of workflows with counts.
- "automationPotential": One opportunity to add triggers or scheduled runs.
- "quickTip": One practical suggestion for workflow improvement.
`;

    const completion = await client.createCompletion({
      messages: [
        { role: "system", content: "You are a workflow automation expert. You speak only valid JSON. Do not include markdown formatting or explanations." },
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
    } catch {
      console.error("Failed to parse AI response:", responseContent);
      return NextResponse.json({
        weeklyFocus: "Could not analyze workflows at this time.",
        commonPatterns: [],
        optimizations: [],
        complexity: "Unknown",
        topWorkflowTypes: [],
        automationPotential: "",
        quickTip: ""
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Workspace Insights Error:", error);
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
