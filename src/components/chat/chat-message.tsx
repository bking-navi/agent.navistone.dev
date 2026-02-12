"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart } from "@/components/analytics/bar-chart";
import { LineChart } from "@/components/analytics/line-chart";
import { MetricsCard } from "@/components/analytics/metrics-card";
import { DataTable } from "@/components/analytics/data-table";
import { FunnelChart } from "@/components/analytics/funnel-chart";
import { AudiencePreview } from "@/components/analytics/audience-preview";
import { ActionButtons } from "./action-buttons";
import { User, Bot } from "lucide-react";
import type { ChatMessage as ChatMessageType, ActionButton, ChartDataPoint, MetricData, TableData, FunnelStage, AudiencePreviewData } from "@/types";

interface ChatMessageProps {
  message: ChatMessageType;
  onAction?: (action: ActionButton) => void;
}

export function ChatMessage({ message, onAction }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className={isUser ? "bg-primary text-primary-foreground" : "bg-muted"}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div className={`flex-1 space-y-3 ${isUser ? "flex justify-end" : ""}`}>
        {isUser ? (
          <div className="inline-block bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%]">
            {message.content}
          </div>
        ) : (
          <Card className="max-w-full">
            <CardContent className="p-4 space-y-4">
              {/* Text content */}
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {message.content.split("\n").map((line, i) => (
                  <p key={i} className="mb-2 last:mb-0">{line}</p>
                ))}
              </div>

              {/* Visualization */}
              {message.visualization && (
                <div className="pt-2">
                  {renderVisualization(message.visualization, onAction)}
                </div>
              )}

              {/* Action buttons */}
              {message.actions && message.actions.length > 0 && onAction && (
                <ActionButtons actions={message.actions} onAction={onAction} />
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function renderVisualization(
  config: ChatMessageType["visualization"], 
  onAction?: (action: ActionButton) => void
) {
  if (!config) return null;

  switch (config.type) {
    case "bar":
      return (
        <BarChart
          data={config.data as ChartDataPoint[]}
          title={config.title}
          valuePrefix={config.yKey === "revenue" ? "$" : ""}
          valueSuffix={config.yKey === "roas" ? "x" : ""}
        />
      );
    case "line":
      return (
        <LineChart
          data={config.data as ChartDataPoint[]}
          title={config.title}
          valuePrefix={config.yKey === "revenue" ? "$" : ""}
        />
      );
    case "metrics":
      return <MetricsCard metrics={config.data as MetricData[]} />;
    case "table":
      return <DataTable data={config.data as TableData} />;
    case "funnel":
      return (
        <FunnelChart
          data={config.data as FunnelStage[]}
          title={config.title}
        />
      );
    case "audience_preview":
      return (
        <AudiencePreview
          data={config.data as AudiencePreviewData}
          onAction={onAction}
        />
      );
    default:
      return null;
  }
}
