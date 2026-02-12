"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { MetricData } from "@/types";

interface MetricsCardProps {
  metrics: MetricData[];
}

export function MetricsCard({ metrics }: MetricsCardProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {metrics.map((metric) => (
        <Card key={metric.label} className="bg-muted/50">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">{metric.label}</div>
            <div className="text-2xl font-bold mt-1">
              {typeof metric.value === "number"
                ? metric.value.toLocaleString()
                : metric.value}
            </div>
            {metric.change !== undefined && (
              <div className={`flex items-center gap-1 text-sm mt-1 ${
                metric.change > 0 
                  ? "text-emerald-600" 
                  : metric.change < 0 
                  ? "text-rose-600" 
                  : "text-muted-foreground"
              }`}>
                {metric.change > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : metric.change < 0 ? (
                  <TrendingDown className="h-3 w-3" />
                ) : (
                  <Minus className="h-3 w-3" />
                )}
                <span>
                  {metric.change > 0 ? "+" : ""}
                  {metric.change}%
                  {metric.changeLabel && ` ${metric.changeLabel}`}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
