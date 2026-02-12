import type { ChatMessage, Insight, ChartDataPoint, TableData } from "@/types";
import * as queryEngine from "@/lib/data/query-engine";
import { getChurnRiskCustomers } from "@/lib/data/query-engine";

/**
 * Generate a pre-built response for a specific insight.
 * This makes clicking an insight feel like the AI is proactively sharing what it found.
 */
export function getInsightResponse(insight: Insight): ChatMessage {
  const id = insight.id;
  
  // Match insight to its detailed response
  if (id === "insight-001" || insight.title.toLowerCase().includes("caribbean") && insight.title.toLowerCase().includes("down")) {
    return getCaribbeanDownResponse(insight);
  }
  
  if (id === "insight-002" || insight.title.toLowerCase().includes("suite")) {
    return getSuiteConversionResponse(insight);
  }
  
  if (id === "insight-003" || insight.title.toLowerCase().includes("reactivation")) {
    return getReactivationResponse(insight);
  }
  
  if (id === "insight-004" || insight.title.toLowerCase().includes("churn")) {
    return getChurnRiskResponse(insight);
  }
  
  if (id === "insight-005" || insight.title.toLowerCase().includes("revenue") && insight.title.toLowerCase().includes("target")) {
    return getRevenueAheadResponse(insight);
  }
  
  if (id === "insight-006" || insight.title.toLowerCase().includes("alaska")) {
    return getAlaskaMomentumResponse(insight);
  }
  
  // Fallback generic response
  return {
    id: `insight-${Date.now()}`,
    role: "assistant",
    content: `I noticed ${insight.title.toLowerCase()}. ${insight.description}`,
    timestamp: new Date(),
  };
}

function getCaribbeanDownResponse(insight: Insight): ChatMessage {
  const roasData = queryEngine.getROASByItinerary();
  
  return {
    id: `insight-${Date.now()}`,
    role: "assistant",
    content: `I wanted to flag this — Caribbean bookings dropped 23% compared to our 4-week average. This is unusual since Caribbean is typically our strongest performer.\n\nLooking at possible causes: our last Caribbean-focused campaign ended 2 weeks ago, and we haven't had a follow-up. Competitors may also be running aggressive promotions.\n\nI'd recommend launching a Caribbean retargeting campaign to site visitors from the past 30 days — they've shown intent but haven't converted.`,
    timestamp: new Date(),
    visualization: {
      type: "bar",
      title: "ROAS by Itinerary (for context)",
      data: roasData,
      yKey: "roas",
    },
    actions: [
      { id: "caribbean-retarget", label: "Create Caribbean Retargeting Audience", icon: "users", action: "create_audience" },
    ],
  };
}

function getSuiteConversionResponse(insight: Insight): ChatMessage {
  const cabinData = queryEngine.getRevenueByCabinType();
  
  return {
    id: `insight-${Date.now()}`,
    role: "assistant",
    content: `Good news — Suite cabin bookings hit a 90-day high, reaching 12.4% of total bookings (up from our usual 8.1%). This is driving revenue up since Suites have 2.3x higher AOV.\n\nThe Mediterranean campaigns seem to be the driver — they're attracting a more premium customer. This might be worth leaning into with Suite-specific creative.`,
    timestamp: new Date(),
    visualization: {
      type: "bar",
      title: "Revenue by Cabin Type",
      data: cabinData.map(d => ({ ...d, value: Math.round(d.value / 1000) })),
      yKey: "revenue",
    },
    actions: [
      { id: "suite-audience", label: "Create Suite Prospects Audience", icon: "users", action: "create_audience" },
      { id: "export-suite", label: "Export Data", icon: "download", action: "export_csv" },
    ],
  };
}

function getReactivationResponse(insight: Insight): ChatMessage {
  const campaignData = queryEngine.getROASByCampaignType();
  
  return {
    id: `insight-${Date.now()}`,
    role: "assistant",
    content: `Here's something worth acting on — Reactivation campaigns are delivering 2.1x higher ROAS than Prospecting right now. This makes sense: past customers already trust the brand and know what to expect.\n\nIf you have budget flexibility, shifting 10-15% from Prospecting to Reactivation could meaningfully improve overall efficiency. I can help identify the best reactivation targets.`,
    timestamp: new Date(),
    visualization: {
      type: "bar",
      title: "ROAS by Campaign Type",
      data: campaignData,
      yKey: "roas",
    },
    actions: [
      { id: "create-reactivation", label: "Create Reactivation Audience", icon: "users", action: "create_audience" },
    ],
  };
}

function getChurnRiskResponse(insight: Insight): ChatMessage {
  const churnCustomers = getChurnRiskCustomers(18);
  
  const tableData: TableData = {
    columns: [
      { key: "name", label: "Customer" },
      { key: "loyaltyTier", label: "Tier" },
      { key: "lifetimeValue", label: "LTV" },
      { key: "lastCruiseDate", label: "Last Cruise" },
      { key: "preferredItinerary", label: "Preferred" },
    ],
    rows: churnCustomers.slice(0, 8).map((c) => ({
      name: `${c.firstName} ${c.lastName}`,
      loyaltyTier: c.loyaltyTier,
      lifetimeValue: c.lifetimeValue,
      lastCruiseDate: c.lastCruiseDate,
      preferredItinerary: c.preferredItinerary,
    })),
  };

  return {
    id: `insight-${Date.now()}`,
    role: "assistant",
    content: `Heads up — I found ${churnCustomers.length} customers who haven't cruised in 18+ months and have meaningful lifetime value. These are people who used to sail with you regularly but have gone quiet.\n\nThe good news: lapsed customers often respond well to personalized win-back offers, especially if you can match their preferred itinerary. Here are some of the highest-value ones:`,
    timestamp: new Date(),
    visualization: {
      type: "table",
      title: "High Churn Risk Customers",
      data: tableData,
    },
    actions: [
      { id: "create-winback", label: `Create Win-Back Audience (${churnCustomers.length})`, icon: "users", action: "create_audience" },
      { id: "export-churn", label: "Export Full List", icon: "download", action: "export_csv" },
    ],
  };
}

function getRevenueAheadResponse(insight: Insight): ChatMessage {
  const metrics = queryEngine.getOverallMetrics();
  
  return {
    id: `insight-${Date.now()}`,
    role: "assistant",
    content: `Great start to Q1 — we're tracking 18% ahead of last year's pace. Direct Mail is doing the heavy lifting, with Reactivation campaigns particularly strong.\n\nThe Suite cabin mix is also up, which is boosting average order value. If this trend holds, we're looking at a strong quarter.`,
    timestamp: new Date(),
    visualization: {
      type: "metrics",
      data: [
        { label: "Total Bookings", value: metrics.totalBookings },
        { label: "Attributed Bookings", value: metrics.attributedBookings },
        { label: "Overall ROAS", value: `${metrics.overallROAS}x` },
        { label: "Avg Order Value", value: `$${metrics.averageOrderValue.toLocaleString()}` },
      ],
    },
    actions: [
      { id: "export-summary", label: "Export Summary", icon: "download", action: "export_csv" },
    ],
  };
}

function getAlaskaMomentumResponse(insight: Insight): ChatMessage {
  const bookingsData = queryEngine.getBookingsByItinerary();
  
  return {
    id: `insight-${Date.now()}`,
    role: "assistant",
    content: `Alaska is building momentum — bookings for the May-August season are up 31% compared to this time last year. The early bird campaign is working.\n\nThis is a good sign, but Alaska still has the lowest ROAS overall due to cabin mix (heavy on Inside cabins). Consider testing Balcony upgrade offers in the next campaign to improve margins.`,
    timestamp: new Date(),
    visualization: {
      type: "bar",
      title: "Bookings by Itinerary",
      data: bookingsData,
    },
    actions: [
      { id: "alaska-upgrade", label: "Create Alaska Upgrade Audience", icon: "users", action: "create_audience" },
    ],
  };
}
