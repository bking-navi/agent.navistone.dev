"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, Info } from "lucide-react";
import type { Insight } from "@/types";

interface InsightCardProps {
  insight: Insight;
  onClick?: () => void;
}

const typeConfig = {
  warning: {
    icon: AlertTriangle,
    badgeVariant: "destructive" as const,
    iconClass: "text-amber-500",
  },
  success: {
    icon: TrendingUp,
    badgeVariant: "default" as const,
    iconClass: "text-emerald-500",
  },
  info: {
    icon: Info,
    badgeVariant: "secondary" as const,
    iconClass: "text-blue-500",
  },
};

export function InsightCard({ insight, onClick }: InsightCardProps) {
  const config = typeConfig[insight.type];
  const Icon = config.icon;

  return (
    <Card 
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${config.iconClass}`} />
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <span className="font-medium text-sm leading-tight">{insight.title}</span>
              {insight.metric && (
                <Badge variant={config.badgeVariant} className="shrink-0 text-xs">
                  {insight.metric}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {insight.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
