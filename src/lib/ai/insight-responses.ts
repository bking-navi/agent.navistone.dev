import type { ChatMessage, Insight, ChartDataPoint, TableData, MetricData } from "@/types";
import * as queryEngine from "@/lib/data/query-engine";
import { getChurnRiskCustomers, getRelevancePremium, getGuardrailEffects, getChannelQuality, getExoticOpportunity, getDarkSocialMetrics } from "@/lib/data/query-engine";

/**
 * Generate a pre-built response for a specific insight.
 * This makes clicking an insight feel like the AI is proactively sharing what it found.
 * Updated with NCL CID forensic audit findings.
 */
export function getInsightResponse(insight: Insight): ChatMessage {
  const id = insight.id;
  
  // NCL CID Insights
  if (id === "insight-001" || insight.title.toLowerCase().includes("pinterest")) {
    return getPinterestJunkResponse(insight);
  }
  
  if (id === "insight-002" || insight.title.toLowerCase().includes("leakage") || insight.title.toLowerCase().includes("asia")) {
    return getExoticLeakageResponse(insight);
  }
  
  if (id === "insight-003" || insight.title.toLowerCase().includes("relevance") || insight.title.toLowerCase().includes("aov")) {
    return getRelevancePremiumResponse(insight);
  }
  
  if (id === "insight-004" || insight.title.toLowerCase().includes("hawaii") || insight.title.toLowerCase().includes("guardrail")) {
    return getHawaiiGuardrailResponse(insight);
  }
  
  if (id === "insight-005" || insight.title.toLowerCase().includes("google") || insight.title.toLowerCase().includes("elite")) {
    return getGoogleSearchResponse(insight);
  }
  
  if (id === "insight-006" || insight.title.toLowerCase().includes("dark") || insight.title.toLowerCase().includes("unclassified")) {
    return getDarkSocialResponse(insight);
  }
  
  // Fallback generic response
  return {
    id: `insight-${Date.now()}`,
    role: "assistant",
    content: `I noticed ${insight.title.toLowerCase()}. ${insight.description}\n\n*This analysis is continuously refined as new CID and transaction data flows in.*`,
    timestamp: new Date(),
  };
}

function getPinterestJunkResponse(insight: Insight): ChatMessage {
  const channels = getChannelQuality();
  const pinterest = channels.find(c => c.channel === "Pinterest");
  const display = channels.find(c => c.channel === "Programmatic Display");
  
  const chartData: ChartDataPoint[] = [
    { label: "Pinterest", value: pinterest?.junkRate || 95.2 },
    { label: "Programmatic Display", value: display?.junkRate || 46 },
    { label: "TikTok", value: 78 },
    { label: "Google Search", value: 27 },
    { label: "Email (CRM)", value: 36 },
  ];
  
  return {
    id: `insight-${Date.now()}`,
    role: "assistant",
    content: `🚨 **Critical Finding: Pinterest Traffic is 95.2% Junk**\n\nThe forensic audit reveals that Pinterest is statistically irrelevant to revenue generation. For every 100 clicks you pay for, only 1.7 represent a qualified prospect.\n\n**The Data:**\n• Pinterest: **95.2% Junk Rate** — statistically anomalous for human traffic\n• Programmatic Display: **46% Junk Rate** — 98.4% of budget wasted\n\n**What "Junk" Means:** Visitors with Propensity Score < 0.10 — near-zero engagement, statistically indistinguishable from bots, accidental clicks, or immediate bounces.\n\n**Recommendation:** Cut these channels immediately. The savings can fund the Exotic creative build without asking for net-new budget. This is mathematically risk-free.\n\n*The model continuously monitors channel quality as new visitor data flows in.*`,
    timestamp: new Date(),
    visualization: {
      type: "bar",
      title: "Junk Traffic Rate by Channel",
      data: chartData,
    },
    actions: [
      { id: "view-scorecard", label: "View Full Scorecard", icon: "settings", action: "refine_audience" },
      { id: "export-junk", label: "Export Analysis", icon: "download", action: "export_csv" },
    ],
  };
}

function getExoticLeakageResponse(insight: Insight): ChatMessage {
  const exotic = getExoticOpportunity();
  
  const metrics: MetricData[] = [
    { label: "Asia Elite Households", value: exotic.asiaHouseholds.toLocaleString() },
    { label: "Australia Elite Households", value: exotic.australiaHouseholds.toLocaleString() },
    { label: "Avg Propensity Score", value: exotic.avgPropensityScore.toFixed(2) },
    { label: "Current Match Rate", value: "0%" },
    { label: "Estimated Demand", value: `$${(exotic.totalDemandValue / 1000000).toFixed(0)}M+` },
  ];
  
  return {
    id: `insight-${Date.now()}`,
    role: "assistant",
    content: `🚨 **The "Exotic" Black Hole: 100% Revenue Leakage**\n\nThe most alarming finding: **Zero instances** in the transaction logs where an Asia or Australia ad click resulted in a booking supported by a matched destination postcard.\n\n**The Numbers:**\n• **${exotic.totalEliteHouseholds.toLocaleString()} Elite Households** for Asia + Australia\n• **Propensity Score: 6.18** — these are cart abandoners ready to buy\n• **$${(exotic.totalDemandValue / 1000000).toFixed(0)}M+ gross demand** being ignored\n\n**Root Cause:** This isn't a demand failure — it's an **asset failure**. NCL lacks creative assets for Asia/Australia. The system defaults 100% of this high-value traffic to generic Caribbean creative.\n\n**The Tragedy:** You're paying to acquire international travelers and then actively selling them a product they didn't ask for. These visitors have the highest intent in your database.\n\n*Elite household counts update automatically as new visitor data flows in.*`,
    timestamp: new Date(),
    visualization: {
      type: "metrics",
      data: metrics,
    },
    actions: [
      { id: "build-exotic", label: "View Exotic Households", icon: "users", action: "create_audience" },
      { id: "export-exotic", label: "Export List", icon: "download", action: "export_csv" },
    ],
  };
}

function getRelevancePremiumResponse(insight: Insight): ChatMessage {
  const premium = getRelevancePremium();
  
  const chartData: ChartDataPoint[] = [
    { label: "Matched Creative", value: premium.matchedCreativeAOV },
    { label: "Mismatched Creative", value: premium.mismatchedCreativeAOV },
  ];
  
  return {
    id: `insight-${Date.now()}`,
    role: "assistant",
    content: `**The Relevance Premium: +$${premium.aovLift} AOV Lift Confirmed**\n\nTransactional analysis proves that **creative consistency is a primary driver of AOV**.\n\n**The Finding:**\n• Matched Creative AOV: **$${premium.matchedCreativeAOV.toLocaleString()}**\n• Mismatched Creative AOV: **$${premium.mismatchedCreativeAOV.toLocaleString()}**\n• Lift: **+$${premium.aovLift} (+${premium.aovLiftPercentage}%)**\n\n**The Mechanism:**\nWhen a consumer sees a digital ad for "Hawaii," they form a specific price anchor (~$5,500). If the follow-up mail piece features Hawaii, it reinforces this high-value anchor.\n\nIf it features generic Caribbean (often priced at $799), it disrupts the value perception, causing the consumer to re-evaluate their budget downward.\n\nRelevance isn't a nice-to-have — it's **$${premium.aovLift} per booking** in your pocket.\n\n*This insight is continuously refined as new transaction data flows into the model.*`,
    timestamp: new Date(),
    visualization: {
      type: "bar",
      title: "AOV by Creative Match Status",
      data: chartData,
      yKey: "revenue",
    },
    actions: [
      { id: "view-guardrail", label: "View Guardrail Effect", icon: "settings", action: "refine_audience" },
      { id: "export-premium", label: "Export Analysis", icon: "download", action: "export_csv" },
    ],
  };
}

function getHawaiiGuardrailResponse(insight: Insight): ChatMessage {
  const guardrails = getGuardrailEffects();
  const hawaii = guardrails.find(g => g.destination === "Hawaii")!;
  
  const tableData: TableData = {
    columns: [
      { key: "destination", label: "Destination Intent" },
      { key: "matched", label: "w/ Matched Card" },
      { key: "generic", label: "w/ Generic Card" },
      { key: "drop", label: "Retention Drop" },
      { key: "loss", label: "Loss Per Switch" },
    ],
    rows: guardrails.map(g => ({
      destination: g.destination,
      matched: `${g.retentionWithMatchedCard}%`,
      generic: `${g.retentionWithGenericCard}%`,
      drop: `-${g.retentionDrop} pts`,
      loss: `$${g.lossPerSwitch.toLocaleString()}`,
    })),
  };
  
  return {
    id: `insight-${Date.now()}`,
    role: "assistant",
    content: `**The Guardrail Effect: Hawaii Retention Collapses 70% → 15%**\n\nThe direct mail piece acts as a **strategic firewall** that prevents high-intent customers from downgrading their vacation ambitions.\n\n**Hawaii Intenders:**\n• With matched Hawaii card: **${hawaii.retentionWithMatchedCard}%** book Hawaii\n• With generic Caribbean card: Only **${hawaii.retentionWithGenericCard}%** stay the course\n• Sending a generic card makes them **4.5x more likely to abandon Hawaii**\n\n**The Cost of Switching:**\n• Hawaii booking AOV: **$${hawaii.retainedAOV.toLocaleString()}**\n• Switched to Caribbean: **$${hawaii.switchedAOV.toLocaleString()}**\n• **Loss per switch: $${hawaii.lossPerSwitch.toLocaleString()}**\n\nThe generic default isn't a "safety net" — it's a leakage point.\n\n*Retention patterns update automatically as new booking data flows in.*`,
    timestamp: new Date(),
    visualization: {
      type: "table",
      title: "The Guardrail Effect by Destination",
      data: tableData,
    },
    actions: [
      { id: "calculate-leakage", label: "Calculate Total Leakage", icon: "settings", action: "refine_audience" },
      { id: "export-guardrail", label: "Export Analysis", icon: "download", action: "export_csv" },
    ],
  };
}

function getGoogleSearchResponse(insight: Insight): ChatMessage {
  const channels = getChannelQuality();
  const google = channels.find(c => c.channel === "Google Search")!;
  const email = channels.find(c => c.channel === "Email (CRM)")!;
  
  const chartData: ChartDataPoint[] = channels
    .filter(c => c.verdict === "Benchmark" || c.verdict === "High Performance" || c.verdict === "Good")
    .sort((a, b) => b.eliteRate - a.eliteRate)
    .map(c => ({ label: c.channel, value: c.eliteRate }));
  
  return {
    id: `insight-${Date.now()}`,
    role: "assistant",
    content: `**Google Search: The Workhorse Channel**\n\nGoogle Search is delivering exceptional performance — **${google.eliteRate}% Elite Rate** at massive scale (${google.totalVisitors.toLocaleString()} visitors).\n\n**The Benchmark:**\n• Email (CRM): **${email.eliteRate}%** Elite Rate — your known customers\n• Google Search: **${google.eliteRate}%** Elite Rate — nearly matches CRM quality!\n\n**Why This Matters:**\nGoogle is driving volume AND quality. This channel should be **protected** from budget cuts. It's one of the few paid channels that delivers intent-qualified traffic at scale.\n\n**Contrast with Waste Channels:**\n• Pinterest: 1.7% Elite / 95% Junk\n• Programmatic Display: 1.6% Elite / 46% Junk\n\nGoogle proves that quality at scale is achievable — the problem is channel allocation, not paid media fundamentals.\n\n*Channel quality scores update automatically as new visitor data flows in.*`,
    timestamp: new Date(),
    visualization: {
      type: "bar",
      title: "Elite Buyer Rate by Channel (High Performers)",
      data: chartData,
    },
    actions: [
      { id: "view-scorecard", label: "View Full Scorecard", icon: "settings", action: "refine_audience" },
      { id: "export-channels", label: "Export Analysis", icon: "download", action: "export_csv" },
    ],
  };
}

function getDarkSocialResponse(insight: Insight): ChatMessage {
  const darkSocial = getDarkSocialMetrics();
  
  const metrics: MetricData[] = [
    { label: "Unclassified Visitors", value: `${(darkSocial.unclassifiedVisitors / 1000000).toFixed(1)}M` },
    { label: "Junk Rate in Bucket", value: `${darkSocial.junkRateInUnclassified}%` },
    { label: "Generic Tagging Rate", value: `${darkSocial.genericTaggingRate}%` },
    { label: "Tagged Campaign Score", value: darkSocial.taggedCampaignScoreAvg.toFixed(2) },
    { label: "Untagged Score", value: darkSocial.untaggedCampaignScoreAvg.toFixed(2) },
  ];
  
  return {
    id: `insight-${Date.now()}`,
    role: "assistant",
    content: `**The "Dark Social" Crisis: 19.2M Visitors Invisible**\n\nA deeper audit revealed that **${(darkSocial.unclassifiedVisitors / 1000000).toFixed(1)} Million visitors** are trapped in an "Unclassified" bucket due to tagging failures.\n\n**The Problem:**\n• Agencies are using non-standard tags, bypassing the PM_ (Paid Social) naming convention\n• This traffic has a **${darkSocial.junkRateInUnclassified}% junk rate** — millions being wasted on low-quality impressions\n• Because it's unclassified, these campaigns are **invisible to optimization**\n\n**The Governance Gap:**\n• **${darkSocial.genericTaggingRate}%** of all agency traffic is tagged "Generic"\n• When agencies DO use proper tags (e.g., ABC for Abandoned Cart), scores jump from **${darkSocial.untaggedCampaignScoreAvg}** to **${darkSocial.taggedCampaignScoreAvg}**\n• Accurate tagging nearly **doubles** visibility of high-intent behaviors\n\n**The Fix:** Enforce the tagging mandate. We cannot target what we do not tag. High-definition buyers are being treated with standard-definition marketing.\n\n*Tagging anomalies are automatically flagged as new data flows in.*`,
    timestamp: new Date(),
    visualization: {
      type: "metrics",
      data: metrics,
    },
    actions: [
      { id: "audit-tags", label: "View Tagging Audit", icon: "settings", action: "refine_audience" },
      { id: "export-dark", label: "Export Analysis", icon: "download", action: "export_csv" },
    ],
  };
}
