"use client";

import { useState, useEffect } from "react";
import { Sparkles, Zap, Target, Layers, RefreshCw, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { useNotes } from "@/components/providers/notes-provider";

interface InsightData {
  weeklyFocus: string;
  commonThemes: string[];
  pendingActions: string[];
}

export function WorkspaceInsights() {
  const { notes, loading: notesLoading } = useNotes();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<InsightData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Only analyze if we have enough notes
  const RECENT_COUNT = 5;
  const recentNotes = notes
    .filter(n => !n.archived && !n.deletedAt)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, RECENT_COUNT);

  const hasEnoughData = recentNotes.length >= 2;
  const STORAGE_KEY = 'ainex-notes-workspace-insights';
  const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

  const saveToCache = (insights: InsightData) => {
    const cacheData = {
      insights,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cacheData));
    setLastUpdated(new Date());
  };

  const generateInsights = async () => {
    if (!hasEnoughData || loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Prepare payload
      const payload = recentNotes.map(n => ({
        title: n.title,
        content: n.type === 'checklist' 
          ? n.checklist.map(i => i.text).join('\n') 
          : n.body,
        date: n.updatedAt.toISOString().split('T')[0]
      }));

      const response = await fetch("/api/ai/workspace-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: payload }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate insights");
      }

      const result = await response.json();
      setData(result);
      saveToCache(result);
    } catch (err) {
      console.error(err);
      setError("Could not analyze workspace.");
    } finally {
      setLoading(false);
    }
  };

  // Load from cache or auto-generate
  useEffect(() => {
    if (notesLoading) return;

    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        const { insights, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        
        if (age < CACHE_DURATION) {
          setData(insights);
          setLastUpdated(new Date(timestamp));
          return;
        }
      } catch (e) {
        // Invalid cache, ignore
      }
    }

    // If no cache or expired, generate if we have data and haven't tried yet
    if (hasEnoughData && !data && !loading && !error) {
      // Only auto-generate if we really have nothing
      // We might want to make this manual to save costs, but per user request "regenerates twice" implies they expect persistence
      // Let's keep auto-generation BUT only if we didn't load from cache
      generateInsights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notesLoading, hasEnoughData]); 

  if (notesLoading || !hasEnoughData) return null;

  return (
    <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-accent-400">
            <Sparkles className="h-5 w-5" />
            <h3 className="font-semibold text-white">AI Workspace Insights</h3>
            {lastUpdated && (
              <span className="text-xs text-white/40 font-normal ml-2">
                Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          <button
            onClick={generateInsights}
            disabled={loading}
            className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            title="Refresh Insights"
          >
             <RefreshCw className={clsx("h-4 w-4", loading && "animate-spin")} />
          </button>
        </div>

        {loading ? (
             <div className="flex flex-col items-center justify-center py-8 text-white/50 gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-accent-500" />
                <p className="text-sm">Analyzing your recent notes...</p>
             </div>
        ) : error ? (
            <div className="text-red-400 text-sm py-2">{error}</div>
        ) : data ? (
            <div className="grid gap-6 md:grid-cols-3">
                {/* Focus */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/50">
                        <Target className="h-3.5 w-3.5" />
                        <span>Current Focus</span>
                    </div>
                    <p className="text-sm text-white/90 leading-relaxed">
                        {data.weeklyFocus}
                    </p>
                </div>

                {/* Themes */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/50">
                        <Layers className="h-3.5 w-3.5" />
                        <span>Active Themes</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {data.commonThemes.map((theme, i) => (
                            <span key={i} className="inline-flex items-center rounded-md bg-white/10 px-2.5 py-1 text-xs text-white/80 ring-1 ring-inset ring-white/10">
                                {theme}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/50">
                        <Zap className="h-3.5 w-3.5" />
                        <span>Pending Actions</span>
                    </div>
                    <ul className="space-y-2">
                        {data.pendingActions.map((action, i) => (
                             <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                                <span className="mt-1.5 h-1 w-1 rounded-full bg-accent-400 shrink-0" />
                                <span>{action}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        ) : null}
        
        {/* Decoration */}
        <div className="absolute -top-24 -right-24 h-48 w-48 bg-accent-500/20 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
      </div>
    </div>
  );
}
