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
    const userMessageContent = getUserMessageForInsight(insight);
    
    // Create a natural user message based on the insight
    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userMessageContent,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    
    // For action-oriented insights (funnel, audience), use the API
    if (shouldUseAPI(insight)) {
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMessageContent, context }),
        });
        
        if (response.ok) {
          const data = await response.json();
          setMessages((prev) => [...prev, data.message]);
          setContext(data.context);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      // For data-driven insights, use pre-built responses
      setTimeout(() => {
        const response = getInsightResponse(insight);
        setMessages((prev) => [...prev, response]);
        setIsLoading(false);
      }, 500 + Math.random() * 400);
    }
  };

  // Generate a natural user message for each insight type
  function getUserMessageForInsight(insight: Insight): string {
    const title = insight.title.toLowerCase();
    const id = insight.id;
    
    // Action-oriented insights
    if (id === "insight-funnel") {
      return "Show me the conversion funnel";
    }
    if (id === "insight-audience") {
      return "Show me reactivation opportunities";
    }
    
    // Data-driven insights
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
  
  // Check if insight should use the API instead of pre-built response
  function shouldUseAPI(insight: Insight): boolean {
    return insight.id === "insight-funnel" || insight.id === "insight-audience";
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
        const audienceCount = action.payload?.count;
        return `This will create a new audience segment${audienceCount ? ` with ${audienceCount} customers` : ""}. You can use this segment for targeted campaigns in your CDP.`;
      case "export_csv":
        return `This will download the data as a CSV file that you can open in Excel or import into other tools.`;
      case "schedule_report":
        return `This will set up an automated report that will be delivered to your inbox on a regular schedule.`;
      case "launch_campaign":
        const rec = action.payload?.recommendation as { campaignType?: string; channel?: string; expectedResponseRate?: number } | undefined;
        if (rec) {
          return `This will launch a ${rec.campaignType} campaign via ${rec.channel}. Expected response rate: ${((rec.expectedResponseRate || 0) * 100).toFixed(1)}%. You'll be able to review creative and confirm before sending.`;
        }
        return `This will start the campaign creation workflow with the recommended settings.`;
      case "refine_audience":
        return `This will open the audience builder so you can adjust the criteria and preview different segments.`;
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-2 pt-4">
                <h2 className="text-2xl font-semibold">NaviStone Analytics Agent</h2>
                <p className="text-muted-foreground">
                  Ask questions about your campaign performance, customer segments, and more.
                </p>
              </div>
              
              {/* Input - prominently placed in empty state */}
              <div className="pt-2">
                <ChatInput onSend={sendMessage} disabled={isLoading} />
              </div>
              
              {/* Insights */}
              <ProactiveInsights 
                insights={getRecentInsights(4)} 
                onInsightClick={handleInsightClick} 
              />
              
              {/* Suggested questions */}
              <SuggestedQuestions onSelect={sendMessage} />
            </div>
          ) : (
            <div className="space-y-4">
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
              <div ref={scrollRef} />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input area - only show at bottom when there are messages */}
      {messages.length > 0 && (
        <div className="w-full">
          <div className="max-w-3xl mx-auto px-4 pb-4">
            {/* ml-11 = 44px to align with message content (32px avatar + 12px gap) */}
            <div className="ml-11">
              <ChatInput onSend={sendMessage} disabled={isLoading} />
            </div>
          </div>
        </div>
      )}

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
