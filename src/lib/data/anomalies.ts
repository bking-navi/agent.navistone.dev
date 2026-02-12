import type { Insight } from "@/types";

// Pre-computed anomalies/insights for the proactive sidebar
// In a real system, these would be detected by analyzing the data
export const insights: Insight[] = [
  // Action-oriented insights (shown first)
  {
    id: "insight-funnel",
    type: "info",
    title: "View campaign conversion funnel",
    description: "See how your campaigns convert from impressions to site visits to bookings.",
    metric: "Funnel",
    timestamp: new Date("2025-02-02"),
  },
  {
    id: "insight-audience",
    type: "info",
    title: "Build a reactivation audience",
    description: "Find lapsed customers worth targeting. Get ROI projections and campaign recommendations.",
    metric: "Audience",
    timestamp: new Date("2025-02-02"),
  },
  // Data-driven insights
  {
    id: "insight-001",
    type: "warning",
    title: "Caribbean bookings down this week",
    description: "Caribbean itinerary bookings are 23% below the 4-week average. Consider increasing campaign frequency.",
    metric: "-23%",
    change: -23,
    timestamp: new Date("2025-01-28"),
  },
  {
    id: "insight-004",
    type: "warning",
    title: "84 customers at high churn risk",
    description: "Customers with 18+ months since last cruise and LTV > $10k. Recommended for win-back campaign.",
    metric: "84",
    timestamp: new Date("2025-01-31"),
  },
  {
    id: "insight-002",
    type: "success",
    title: "Suite conversion rate at 90-day high",
    description: "Suite cabin bookings reached 12.4% of total, up from 8.1% average. Mediterranean campaigns are driving upgrades.",
    metric: "+53%",
    change: 53,
    timestamp: new Date("2025-01-30"),
  },
  {
    id: "insight-003",
    type: "info",
    title: "Reactivation outperforming Prospecting",
    description: "Reactivation campaigns are delivering 2.1x higher ROAS than Prospecting. Consider shifting budget allocation.",
    metric: "2.1x",
    change: 110,
    timestamp: new Date("2025-01-29"),
  },
  {
    id: "insight-005",
    type: "success",
    title: "Q1 2025 revenue ahead of target",
    description: "Current Q1 bookings are tracking 18% above same period last year. Strong start driven by Direct Mail.",
    metric: "+18%",
    change: 18,
    timestamp: new Date("2025-02-01"),
  },
  {
    id: "insight-006",
    type: "info",
    title: "Alaska season building momentum",
    description: "Alaska sail date bookings for May-August are up 31% vs. last year. Early bird campaign performing well.",
    metric: "+31%",
    change: 31,
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
