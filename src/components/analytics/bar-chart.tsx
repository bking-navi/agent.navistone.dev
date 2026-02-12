"use client";

import type { ChartDataPoint } from "@/types";

interface BarChartProps {
  data: ChartDataPoint[];
  title?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  height?: number;
}

export function BarChart({ data, title, valuePrefix = "", valueSuffix = "", height = 200 }: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value));
  
  // Color palette
  const colors = [
    "bg-blue-500",
    "bg-emerald-500",
    "bg-violet-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-cyan-500",
  ];

  return (
    <div className="space-y-3">
      {title && <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>}
      <div className="space-y-3" style={{ minHeight: height }}>
        {data.map((item, index) => {
          const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          const color = colors[index % colors.length];
          
          return (
            <div key={item.label} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{item.label}</span>
                <span className="text-muted-foreground">
                  {valuePrefix}
                  {typeof item.value === "number" 
                    ? item.value.toLocaleString(undefined, { maximumFractionDigits: 2 })
                    : item.value}
                  {valueSuffix}
                </span>
              </div>
              <div className="h-8 bg-muted rounded-md overflow-hidden">
                <div
                  className={`h-full ${color} transition-all duration-500 ease-out rounded-md`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
