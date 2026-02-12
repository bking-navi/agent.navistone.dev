"use client";

import type { ChartDataPoint } from "@/types";

interface BarChartProps {
  data: ChartDataPoint[];
  title?: string;
  valuePrefix?: string;
  valueSuffix?: string;
}

export function BarChart({ data, title, valuePrefix = "", valueSuffix = "" }: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value));
  
  // Consistent blue palette with varying opacity
  const getBarColor = (index: number) => {
    const colors = [
      "bg-blue-600",
      "bg-blue-500",
      "bg-blue-400",
      "bg-sky-500",
      "bg-sky-400",
      "bg-cyan-500",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="rounded-lg border bg-card p-4">
      {title && (
        <h4 className="text-sm font-semibold mb-4">{title}</h4>
      )}
      <div className="space-y-3">
        {data.map((item, index) => {
          const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          
          return (
            <div key={item.label} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-foreground">{item.label}</span>
                <span className="text-sm font-semibold tabular-nums">
                  {valuePrefix}
                  {typeof item.value === "number" 
                    ? item.value.toLocaleString(undefined, { maximumFractionDigits: 1 })
                    : item.value}
                  {valueSuffix}
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${getBarColor(index)} rounded-full transition-all duration-700 ease-out`}
                  style={{ width: `${Math.max(percentage, 2)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
