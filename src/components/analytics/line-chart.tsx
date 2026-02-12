"use client";

import type { ChartDataPoint } from "@/types";

interface LineChartProps {
  data: ChartDataPoint[];
  title?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  height?: number;
}

export function LineChart({ data, title, valuePrefix = "", valueSuffix = "", height = 200 }: LineChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const range = maxValue - minValue || 1;

  // Calculate points for SVG polyline
  const padding = 40;
  const chartWidth = 100; // percentage-based
  const chartHeight = height - padding;

  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = chartHeight - ((item.value - minValue) / range) * (chartHeight - padding);
    return { x, y, item };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="space-y-3">
      {title && <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>}
      <div className="relative" style={{ height }}>
        <svg
          viewBox={`0 0 100 ${height}`}
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((pct) => (
            <line
              key={pct}
              x1="0"
              y1={padding / 2 + ((100 - pct) / 100) * (chartHeight - padding)}
              x2="100"
              y2={padding / 2 + ((100 - pct) / 100) * (chartHeight - padding)}
              className="stroke-muted"
              strokeWidth="0.2"
            />
          ))}

          {/* Area fill */}
          <polygon
            points={`0,${chartHeight} ${polylinePoints} 100,${chartHeight}`}
            className="fill-blue-500/10"
          />

          {/* Line */}
          <polyline
            points={polylinePoints}
            fill="none"
            className="stroke-blue-500"
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="1.5"
              className="fill-blue-500"
            />
          ))}
        </svg>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground px-1">
          {data.filter((_, i) => i % Math.ceil(data.length / 6) === 0 || i === data.length - 1).map((item) => (
            <span key={item.label}>{item.label}</span>
          ))}
        </div>
      </div>

      {/* Legend / summary */}
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">
          Min: {valuePrefix}{minValue.toLocaleString()}{valueSuffix}
        </span>
        <span className="text-muted-foreground">
          Max: {valuePrefix}{maxValue.toLocaleString()}{valueSuffix}
        </span>
      </div>
    </div>
  );
}
