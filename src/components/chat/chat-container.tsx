"use client";

import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { SuggestedQuestions } from "./suggested-questions";
import { ProactiveInsights } from "./proactive-insights";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import type { ChatMessage as ChatMessageType, QueryContext, ActionButton, Insight } from "@/types";
import { getRecentInsights } from "@/lib/data/anomalies";
import { getInsightResponse } from "@/lib/ai/insight-responses";

export function ChatContainer() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [context, setContext] = useState<QueryContext>({});
  const [isLoading, setIsLoading] = useState(false);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: ActionButton | null;
    confirmed: boolean;
  }>({ open: false, action: null, confirmed: false });

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async (content: string) => {
    // Add user message immediately
    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, context }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      setMessages((prev) => [...prev, data.message]);
      setContext(data.context);
    } catch (error) {
      console.error("Error sending message:", error);
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I encountered an error processing your request. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsightClick = async (insight: Insight) => {
    // Create a natural user message based on the insight
    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      role: "user",
      content: getUserMessageForInsight(insight),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    
    // Small delay to feel natural
    setTimeout(() => {
      const response = getInsightResponse(insight);
      setMessages((prev) => [...prev, response]);
      setIsLoading(false);
    }, 500 + Math.random() * 400);
  };

  // Generate a natural user message for each insight type
  function getUserMessageForInsight(insight: Insight): string {
    const title = insight.title.toLowerCase();
    
    if (title.includes("caribbean") && title.includes("down")) {
      return "What's going on with Caribbean bookings?";
    }
    if (title.includes("churn")) {
      return "Tell me about these at-risk customers";
    }
    if (title.includes("suite") || title.includes("conversion")) {
      return "What's driving the Suite bookings increase?";
    }
    if (title.includes("reactivation") && title.includes("prospecting")) {
      return "Tell me more about Reactivation vs Prospecting";
    }
    if (title.includes("revenue") && title.includes("target")) {
      return "How are we tracking against target?";
    }
    if (title.includes("alaska")) {
      return "What's happening with Alaska bookings?";
    }
    
    return "Tell me more about this";
  }

  const handleAction = (action: ActionButton) => {
    setActionDialog({ open: true, action, confirmed: false });
  };

  const confirmAction = () => {
    setActionDialog((prev) => ({ ...prev, confirmed: true }));
    // In a real app, this would trigger the actual action
    setTimeout(() => {
      setActionDialog({ open: false, action: null, confirmed: false });
    }, 1500);
  };

  const getActionDescription = (action: ActionButton | null) => {
    if (!action) return "";
    switch (action.action) {
      case "create_audience":
        return `This will create a new audience segment with the selected customers. You can use this segment for targeted campaigns.`;
      case "export_csv":
        return `This will download the data as a CSV file that you can open in Excel or import into other tools.`;
      case "schedule_report":
        return `This will set up an automated report that will be delivered to your inbox on a regular schedule.`;
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <div className="py-8 space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold">NaviStone Analytics Agent</h2>
                <p className="text-muted-foreground">
                  Ask questions about your campaign performance, customer segments, and more.
                </p>
              </div>
              
              <ProactiveInsights 
                insights={getRecentInsights(4)} 
                onInsightClick={handleInsightClick} 
              />
              
              <SuggestedQuestions onSelect={sendMessage} />
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onAction={handleAction}
                />
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm animate-pulse">Analyzing your data...</span>
                </div>
              )}
            </>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input area */}
      <ChatInput onSend={sendMessage} disabled={isLoading} />

      {/* Action confirmation dialog */}
      <Dialog
        open={actionDialog.open}
        onOpenChange={(open) => !actionDialog.confirmed && setActionDialog({ open, action: null, confirmed: false })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionDialog.action?.label}</DialogTitle>
            <DialogDescription>{getActionDescription(actionDialog.action)}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            {actionDialog.confirmed ? (
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
                <span>Done!</span>
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setActionDialog({ open: false, action: null, confirmed: false })}
                >
                  Cancel
                </Button>
                <Button onClick={confirmAction}>Confirm</Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
