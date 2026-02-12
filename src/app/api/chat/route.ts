import { NextRequest, NextResponse } from "next/server";
import { processQuery } from "@/lib/ai/mock-engine";
import { generateWithLLM } from "@/lib/ai/llm-adapter";
import type { QueryContext } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context = {} } = body as { message: string; context: QueryContext };

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Calculate thinking delay based on query complexity
    const wordCount = message.split(/\s+/).length;
    const hasWhy = /why|how come|explain/i.test(message);
    const baseDelay = 600;
    const complexityDelay = Math.min(wordCount * 50, 400);
    const whyDelay = hasWhy ? 300 : 0;
    const totalDelay = baseDelay + complexityDelay + whyDelay + Math.random() * 400;
    
    await new Promise((resolve) => setTimeout(resolve, totalDelay));

    // Get data and visualization from mock engine
    const result = processQuery(message, context);

    // If OpenAI key is configured, enhance the response with LLM
    if (process.env.OPENAI_API_KEY) {
      const enhancedMessage = await generateWithLLM(message, result.message, context);
      if (enhancedMessage) {
        return NextResponse.json({
          message: { ...result.message, content: enhancedMessage },
          context: result.newContext,
        });
      }
    }

    return NextResponse.json({
      message: result.message,
      context: result.newContext,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
