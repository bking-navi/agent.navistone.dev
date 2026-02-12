"use client";

import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
}

const suggestions = [
  "What's our ROAS by itinerary over the last 90 days?",
  "Show bookings and revenue by cabin type",
  "Which sail dates are most responsive to prospecting vs reactivation?",
  "How many customers are in each loyalty tier?",
  "Which customers are at risk of churning?",
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
            className="text-left h-auto py-2 px-3 whitespace-normal"
            onClick={() => onSelect(question)}
          >
            {question}
          </Button>
        ))}
      </div>
    </div>
  );
}
