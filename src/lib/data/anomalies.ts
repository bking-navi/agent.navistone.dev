import type { Insight } from "@/types";

// Pre-computed anomalies/insights for the proactive sidebar
// Based on John's Forensic Audit findings for NCL CID data
export const insights: Insight[] = [
  // Action-oriented insights (shown first)
  {
    id: "insight-exotic",
    type: "info",
    title: "View the Exotic Opportunity",
    description: "101,153 Elite households for Asia/Australia with 0% matched creative — $500M+ demand pool.",
    metric: "$500M+",
    timestamp: new Date("2025-02-02"),
  },
  {
    id: "insight-channels",
    type: "info",
    title: "View Channel Quality Scorecard",
    description: "See which channels deliver Elite buyers vs. junk traffic. Find the funding source for the fix.",
    metric: "Scorecard",
    timestamp: new Date("2025-02-02"),
  },
  // Data-driven insights from the audit
  {
    id: "insight-001",
    type: "warning",
    title: "Pinterest traffic 95% junk",
    description: "Forensic audit reveals 95.2% of Pinterest visitors are bots or immediate bounces. Only 1.7% are Elite buyers.",
    metric: "95%",
    change: -95,
    timestamp: new Date("2025-02-01"),
  },
  {
    id: "insight-002",
    type: "warning",
    title: "100% leakage on Asia/Australia",
    description: "Zero matched creative for 101,153 Elite households with propensity score 6.18 — they're ready to buy.",
    metric: "0%",
    change: -100,
    timestamp: new Date("2025-01-31"),
  },
  {
    id: "insight-003",
    type: "success",
    title: "Relevance Premium confirmed: +$870 AOV",
    description: "When creative matches intent, AOV jumps from $4,723 to $5,593. That's +18% per booking.",
    metric: "+$870",
    change: 18,
    timestamp: new Date("2025-01-30"),
  },
  {
    id: "insight-004",
    type: "warning",
    title: "Hawaii guardrail failing: 70% → 15%",
    description: "Hawaii intenders with matched card retain 70%. With generic card, only 15% stay — $2,400 loss per switch.",
    metric: "-55 pts",
    change: -55,
    timestamp: new Date("2025-01-29"),
  },
  {
    id: "insight-005",
    type: "success",
    title: "Google Search delivering 40% Elite",
    description: "13.7M visitors at 40.1% Elite rate — the workhorse channel nearly matches CRM quality. Protect this budget.",
    metric: "40.1%",
    change: 40,
    timestamp: new Date("2025-01-28"),
  },
  {
    id: "insight-006",
    type: "info",
    title: "Dark Social: 19.2M unclassified",
    description: "Tagging failures hiding social spend with 69.6% junk rate. Fix the governance gap to optimize these campaigns.",
    metric: "19.2M",
    timestamp: new Date("2025-01-27"),
  },
];

export function getRecentInsights(limit: number = 4): Insight[] {
  return [...insights]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
}

export function getInsightsByType(type: Insight["type"]): Insight[] {
  return insights.filter((i) => i.type === type);
}
