"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { InsightCard } from "./insight-card";
import { Sparkles } from "lucide-react";
import type { Insight } from "@/types";

interface InsightsSidebarProps {
  insights: Insight[];
  onInsightClick?: (insight: Insight) => void;
}

export function InsightsSidebar({ insights, onInsightClick }: InsightsSidebarProps) {
  return (
    <div className="h-full w-full flex flex-col border-l bg-muted/30 overflow-hidden">
      <div className="p-4 border-b shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <h2 className="font-semibold">AI Insights</h2>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Anomalies and opportunities detected in your data
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {insights.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onClick={() => onInsightClick?.(insight)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
