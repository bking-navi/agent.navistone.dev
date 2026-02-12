import type { ChatMessage, QueryContext } from "@/types";

const SYSTEM_PROMPT = `You are an AI analytics assistant for NaviStone, a direct mail marketing company serving cruise lines. You help marketing teams understand their campaign performance data.

Your responses should be:
- Conversational and helpful, like a knowledgeable colleague
- Data-driven but not robotic
- Actionable - suggest what they might do with the insight
- Concise - 2-3 sentences max for the main insight

You'll receive the user's question and pre-computed data/analysis. Your job is to present that data in a natural, insightful way. Don't make up numbers - use only the data provided.

Important context:
- ROAS = Return on Ad Spend (revenue / ad spend)
- Campaign types: Prospecting (cold audiences), Reactivation (lapsed customers), Retargeting (site visitors)
- Itineraries: Caribbean, Alaska, Europe, Mediterranean
- Cabin types: Inside, Ocean View, Balcony, Suite (in order of price)`;

export async function generateWithLLM(
  userQuery: string,
  mockResponse: ChatMessage,
  context: QueryContext
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const dataContext = mockResponse.visualization 
      ? `\n\nData to present:\n${JSON.stringify(mockResponse.visualization.data, null, 2)}`
      : "";
    
    const previousContext = context.lastQuery 
      ? `\n\nPrevious question was: "${context.lastQuery}"`
      : "";

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { 
            role: "user", 
            content: `User asked: "${userQuery}"${previousContext}${dataContext}\n\nProvide a natural, insightful response presenting this data. Be conversational and suggest what action they might take.`
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error("OpenAI API error:", await response.text());
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error("LLM generation error:", error);
    return null;
  }
}
