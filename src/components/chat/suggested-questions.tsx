"use client";

import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
}

const suggestions = [
  "What's our ROAS by itinerary?",
  "Show me the conversion funnel",
  "Show bookings by cabin type",
  "How are we tracking this quarter?",
  "Build an audience of lapsed customers",
  "Recommend a campaign for reactivation",
  "Which customers are at high churn risk?",
  "What's the ROI if we target lapsed customers?",
  "Compare prospecting vs reactivation",
  "Show revenue trend over time",
];

export function SuggestedQuestions({ onSelect }: SuggestedQuestionsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="h-4 w-4" />
        <span>Try asking</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((question) => (
          <Button
            key={question}
            variant="outline"
            size="sm"
            className="text-left h-auto py-2 px-3"
            onClick={() => onSelect(question)}
          >
            {question}
          </Button>
        ))}
      </div>
    </div>
  );
}
