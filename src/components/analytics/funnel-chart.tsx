"use client";

import type { FunnelStage } from "@/types";
import { ArrowRight } from "lucide-react";

interface FunnelChartProps {
  data: FunnelStage[];
  title?: string;
}

export function FunnelChart({ data, title }: FunnelChartProps) {
  if (data.length === 0) return null;
  
  const maxCount = data[0].count;
  
  // Progressive color scheme
  const getStageColor = (index: number) => {
    const colors = [
      { bg: "bg-blue-600", light: "bg-blue-100 dark:bg-blue-950" },
      { bg: "bg-sky-500", light: "bg-sky-100 dark:bg-sky-950" },
      { bg: "bg-emerald-500", light: "bg-emerald-100 dark:bg-emerald-950" },
    ];
    return colors[index % colors.length];
  };

  // Use square root scale to give small values more visual presence
  // Scale so that 100% maps to 100% width
  const scalePercent = (percent: number) => {
    // sqrt(100) = 10, so multiply by 10 to get 100% at full
    return Math.min(Math.sqrt(percent) * 10, 100);
  };

  const overallConversion = maxCount > 0 && data.length > 0
    ? ((data[data.length - 1].count / maxCount) * 100)
    : 0;

  return (
    <div className="rounded-lg border bg-card p-4">
      {title && (
        <h4 className="text-sm font-semibold mb-4">{title}</h4>
      )}
      
      {/* Funnel stages as horizontal bars */}
      <div className="space-y-3">
        {data.map((stage, index) => {
          const widthPercent = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
          const colors = getStageColor(index);
          const isLast = index === data.length - 1;
          
          return (
            <div key={stage.stage} className="space-y-1">
              {/* Stage row */}
              <div className="relative p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stage.stage}</p>
                    <p className="text-2xl font-bold tabular-nums">
                      {stage.count.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-semibold">
                      {index === 0 ? "100" : widthPercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
                {/* Progress bar - using scaled width for better visibility */}
                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${colors.bg} rounded-full transition-all duration-700`}
                    style={{ width: `${scalePercent(widthPercent)}%` }}
                  />
                </div>
              </div>
              
              {/* Conversion arrow between stages */}
              {!isLast && stage.conversionRate !== undefined && (
                <div className="flex items-center justify-center gap-2 py-1 text-muted-foreground">
                  <ArrowRight className="h-3 w-3 rotate-90" />
                  <span className="text-xs font-medium">
                    {stage.conversionRate.toFixed(1)}% converted
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Summary stat */}
      <div className="mt-4 pt-4 border-t flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">End-to-end conversion</p>
          <p className="text-xl font-bold text-emerald-600">
            {overallConversion.toFixed(2)}%
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total {data[data.length - 1]?.stage}</p>
          <p className="text-xl font-bold">
            {data[data.length - 1]?.count.toLocaleString() || 0}
          </p>
        </div>
      </div>
    </div>
  );
}
