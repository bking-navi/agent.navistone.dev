"use client";

import { ChatContainer } from "@/components/chat/chat-container";
import { Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="font-semibold">NaviStone Analytics</h1>
              <p className="text-xs text-muted-foreground">Continuously learning from NCL's CID and transaction data</p>
            </div>
          </div>
        </header>

        {/* Chat */}
        <ChatContainer />
      </div>
    </div>
  );
}
