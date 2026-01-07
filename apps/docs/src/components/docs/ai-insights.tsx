"use client";

import { useState } from "react";
import { Sparkles, FileText, ListTodo, Tags, RefreshCw, Plus } from "lucide-react";
import { clsx } from "clsx";
import { Loader2 } from "lucide-react";

interface AiInsightsProps {
  title: string;
  content: string;
  onAddChecklistItems?: (items: string[]) => void;
  onAddTags?: (tags: string[]) => void;
}

interface InsightData {
  summary: string;
  actionItems: string[];
  tags: string[];
}

export function AiInsights({ title, content, onAddChecklistItems, onAddTags }: AiInsightsProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<InsightData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const generateInsights = async () => {
    if (!title && !content) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate insights");
      }

      const result = await response.json();
      setData(result);
      setExpanded(true);
    } catch (err) {
      setError("Could not generate insights. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!data && !loading && !expanded) {
    return (
      <div className="flex justify-start">
        <button
          type="button"
          onClick={generateInsights}
          disabled={(!title && !content)}
          className="group inline-flex items-center gap-2 rounded-full border border-border bg-foreground/5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-foreground/10 hover:text-foreground hover:border-border/80 disabled:opacity-50 disabled:hover:bg-foreground/5 disabled:hover:text-muted-foreground transition-all"
        >
          <Sparkles className="h-3.5 w-3.5 text-accent-400 transition-transform group-hover:scale-110" />
          Generate AI Insights
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-foreground/5 p-4 text-sm backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-accent-400 font-semibold">
          <Sparkles className="h-4 w-4" />
          <h3 className="text-foreground">AI Insights</h3>
        </div>
        <div className="flex gap-2">
           {data && (
            <button
              type="button"
              onClick={generateInsights}
              disabled={loading}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-foreground/10"
              title="Regenerate"
            >
              <RefreshCw className={clsx("h-3.5 w-3.5", loading && "animate-spin")} />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 py-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-accent-400" />
          <span>Analyzing your doc...</span>
        </div>
      ) : error ? (
        <div className="text-red-400 text-xs">{error}</div>
      ) : data ? (
        <div className="space-y-4">
          {/* Summary */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <FileText className="h-3.5 w-3.5" />
              <span>Summary</span>
            </div>
            <p className="text-foreground/80 leading-relaxed pl-5">
              {data.summary}
            </p>
          </div>

          {/* Action Items */}
          {data.actionItems.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <div className="flex items-center gap-2">
                  <ListTodo className="h-3.5 w-3.5" />
                  <span>Suggested Actions</span>
                </div>
                {onAddChecklistItems && (
                  <button
                    onClick={() => onAddChecklistItems(data.actionItems)}
                    className="flex items-center gap-1 text-[10px] text-accent-400 hover:text-accent-300 hover:underline"
                  >
                    <Plus className="h-3 w-3" /> Add all to checklist
                  </button>
                )}
              </div>
              <ul className="space-y-1 pl-5">
                {data.actionItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-foreground/80">
                    <span className="mt-1.5 h-1 w-1 rounded-full bg-accent-400 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          {data.tags.length > 0 && (
            <div className="space-y-1.5">
               <div className="flex items-center justify-between text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <div className="flex items-center gap-2">
                  <Tags className="h-3.5 w-3.5" />
                  <span>Suggested Tags</span>
                </div>
                {onAddTags && (
                  <button
                    onClick={() => onAddTags(data.tags)}
                    className="flex items-center gap-1 text-[10px] text-accent-400 hover:text-accent-300 hover:underline"
                  >
                    <Plus className="h-3 w-3" /> Add tags
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2 pl-5">
                {data.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-md bg-foreground/10 border border-border px-2 py-1 text-xs text-foreground/80"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
