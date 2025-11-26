"use client";

import { useState, useEffect, useMemo } from "react";
import { Zap, Clock, ShieldAlert } from "lucide-react";
import {
  AIInsightsCard,
  AIInsightsBulletList,
  AIInsightsText,
  type AIInsightsSection,
} from "@ainexsuite/ui";

interface InsightData {
  energyTip: string;
  securityAlerts: string[];
  routineSuggestion: string;
}

export function SmartHubInsights({ variant = "default" }: { variant?: "default" | "sidebar" }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<InsightData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Mock insights generation
  const generateInsights = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate AI thinking
    
    setData({
      energyTip: "Your Living Room lights are on for 4+ hours after midnight. Automate shutoff to save ~15% energy.",
      securityAlerts: [
        "Front Door was unlocked for 2 hours yesterday while everyone was away.",
        "Backyard Camera detected motion at 3 AM (Raccoon probable)."
      ],
      routineSuggestion: "You consistently set the thermostat to 68° at 10 PM. Create a 'Sleep Mode' routine?"
    });
    
    setLastUpdated(new Date());
    setLoading(false);
  };

  useEffect(() => {
    generateInsights();
  }, []);

  const sections: AIInsightsSection[] = useMemo(() => {
    if (!data) return [];

    return [
      {
        icon: <ShieldAlert className="h-3.5 w-3.5" />,
        label: "Security Watch",
        content: <AIInsightsBulletList items={data.securityAlerts} accentColor="#ef4444" />,
      },
      {
        icon: <Zap className="h-3.5 w-3.5" />,
        label: "Energy Saver",
        content: <AIInsightsText>{data.energyTip}</AIInsightsText>,
      },
      {
        icon: <Clock className="h-3.5 w-3.5" />,
        label: "Routine Discovery",
        content: <AIInsightsText>{data.routineSuggestion}</AIInsightsText>,
      },
    ];
  }, [data]);

  return (
    <AIInsightsCard
      title="Home Intelligence"
      sections={sections}
      accentColor="#0ea5e9" // Sky blue
      variant={variant}
      isLoading={loading}
      loadingMessage="Analyzing device patterns..."
      lastUpdated={lastUpdated}
      onRefresh={generateInsights}
      refreshDisabled={loading}
    />
  );
}
