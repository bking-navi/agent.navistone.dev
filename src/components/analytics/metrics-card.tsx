"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { MetricData } from "@/types";

interface MetricsCardProps {
  metrics: MetricData[];
}

export function MetricsCard({ metrics }: MetricsCardProps) {
  // Determine grid columns based on number of metrics
  const gridCols = metrics.length <= 2 
    ? "grid-cols-2" 
    : metrics.length === 3 
    ? "grid-cols-3" 
    : "grid-cols-2 sm:grid-cols-4";

  return (
    <div className={`grid ${gridCols} gap-3`}>
      {metrics.map((metric, index) => (
        <div 
          key={metric.label} 
          className="rounded-lg border bg-card p-4 space-y-1"
        >
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {metric.label}
          </p>
          <p className="text-2xl font-bold tabular-nums">
            {typeof metric.value === "number"
              ? metric.value.toLocaleString()
              : metric.value}
          </p>
          {metric.change !== undefined && (
            <div className={`flex items-center gap-1 text-sm ${
              metric.change > 0 
                ? "text-emerald-600" 
                : metric.change < 0 
                ? "text-rose-600" 
                : "text-muted-foreground"
            }`}>
              {metric.change > 0 ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : metric.change < 0 ? (
                <TrendingDown className="h-3.5 w-3.5" />
              ) : (
                <Minus className="h-3.5 w-3.5" />
              )}
              <span className="font-medium">
                {metric.change > 0 ? "+" : ""}
                {metric.change}%
              </span>
              {metric.changeLabel && (
                <span className="text-muted-foreground text-xs">{metric.changeLabel}</span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
