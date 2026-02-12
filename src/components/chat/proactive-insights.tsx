"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, Info, Lightbulb } from "lucide-react";
import type { Insight } from "@/types";

interface ProactiveInsightsProps {
  insights: Insight[];
  onInsightClick: (insight: Insight) => void;
}

const typeConfig = {
  warning: {
    icon: AlertTriangle,
    badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    borderClass: "border-amber-200 dark:border-amber-800",
  },
  success: {
    icon: TrendingUp,
    badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    borderClass: "border-emerald-200 dark:border-emerald-800",
  },
  info: {
    icon: Info,
    badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    borderClass: "border-blue-200 dark:border-blue-800",
  },
};

export function ProactiveInsights({ insights, onInsightClick }: ProactiveInsightsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Lightbulb className="h-4 w-4" />
        <span>I noticed some things in your data</span>
      </div>
      
      <div className="grid gap-2 sm:grid-cols-2">
        {insights.map((insight) => {
          const config = typeConfig[insight.type];
          const Icon = config.icon;
          
          return (
            <Card
              key={insight.id}
              className={`cursor-pointer hover:bg-muted/50 transition-colors border ${config.borderClass}`}
              onClick={() => onInsightClick(insight)}
            >
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <Icon className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium text-sm leading-tight">
                        {insight.title}
                      </span>
                      {insight.metric && (
                        <Badge 
                          variant="secondary" 
                          className={`shrink-0 text-xs ${config.badgeClass}`}
                        >
                          {insight.metric}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
