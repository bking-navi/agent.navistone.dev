"use client";

import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
}

const suggestions = [
  "Which destinations have the highest quality visitor traffic?",
  "Which marketing channels deliver the highest quality traffic?",
  "Show me the Exotic opportunity (Asia/Australia)",
  "What's the relevance premium when creative matches intent?",
  "Which channels are generating the most junk traffic?",
  "Show visitor profiles for high-intent customers",
  "What's the guardrail effect for Europe intenders?",
  "How much revenue are we losing to creative mismatch?",
  "Which destinations have the highest purchase intent scores?",
  "Show me the channel quality scorecard",
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
