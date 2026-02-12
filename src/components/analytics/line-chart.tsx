"use client";

import type { ChartDataPoint } from "@/types";

interface LineChartProps {
  data: ChartDataPoint[];
  title?: string;
  valuePrefix?: string;
  valueSuffix?: string;
}

export function LineChart({ data, title, valuePrefix = "", valueSuffix = "" }: LineChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const range = maxValue - minValue || 1;

  const svgWidth = 500;
  const svgHeight = 160;
  const paddingTop = 10;
  const paddingBottom = 5;
  const paddingLeft = 5;
  const paddingRight = 5;
  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const points = data.map((item, index) => {
    const x = paddingLeft + (data.length > 1 ? (index / (data.length - 1)) * chartWidth : chartWidth / 2);
    const y = paddingTop + chartHeight - ((item.value - minValue) / range) * chartHeight;
    return { x, y, item };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPoints = `${paddingLeft},${svgHeight - paddingBottom} ${polylinePoints} ${svgWidth - paddingRight},${svgHeight - paddingBottom}`;

  // Show ~5 labels evenly distributed
  const labelInterval = Math.ceil(data.length / 5);

  return (
    <div className="rounded-lg border bg-card p-4">
      {title && (
        <h4 className="text-sm font-semibold mb-4">{title}</h4>
      )}
      
      <div className="relative">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto"
          style={{ maxHeight: 180 }}
        >
          {/* Horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
            <line
              key={i}
              x1={paddingLeft}
              y1={paddingTop + chartHeight * (1 - pct)}
              x2={svgWidth - paddingRight}
              y2={paddingTop + chartHeight * (1 - pct)}
              stroke="currentColor"
              className="text-muted/30"
              strokeWidth="1"
            />
          ))}

          {/* Gradient definition */}
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <polygon
            points={areaPoints}
            fill="url(#areaGradient)"
          />

          {/* Line */}
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="rgb(59, 130, 246)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="4"
              fill="white"
              stroke="rgb(59, 130, 246)"
              strokeWidth="2"
            />
          ))}
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between text-xs text-muted-foreground mt-2 px-1">
          {data.map((item, i) => (
            (i % labelInterval === 0 || i === data.length - 1) ? (
              <span key={i}>{item.label}</span>
            ) : (
              <span key={i} className="w-0" />
            )
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="flex justify-between text-xs text-muted-foreground mt-3 pt-3 border-t">
        <div>
          <span className="text-foreground font-medium">Min:</span> {valuePrefix}{minValue.toLocaleString()}{valueSuffix}
        </div>
        <div>
          <span className="text-foreground font-medium">Max:</span> {valuePrefix}{maxValue.toLocaleString()}{valueSuffix}
        </div>
      </div>
    </div>
  );
}
