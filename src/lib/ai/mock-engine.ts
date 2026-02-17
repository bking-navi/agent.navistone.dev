import type { ChatMessage, QueryContext, VisualizationConfig, ActionButton, ChartDataPoint, MetricData, TableData, AudiencePreviewData, AudienceCriteria } from "@/types";
import * as queryEngine from "@/lib/data/query-engine";
import { getChurnRiskCustomers, getHighValueLapsedCustomers, getFunnelData, getFunnelByCampaignType, buildAudience, calculateROIProjection, getAudienceForReactivation, getAudienceForHighValueLapsed, getAudienceForItinerary, getRelevancePremium, getGuardrailEffects, getEliteHouseholds, getChannelQuality, getDestinationQuality, getVisitorProfiles, getExoticOpportunity, getLowQualityChannels, getHighQualityChannels, getDarkSocialMetrics } from "@/lib/data/query-engine";
import { generateCampaignRecommendation, generateReactivationRecommendation } from "@/lib/ai/recommendations";
import { customers } from "@/lib/data/customers";

// Natural language variation helpers
const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const openings = {
  analysis: [
    "Looking at your data,",
    "Based on the numbers,",
    "Here's what I found:",
    "Interesting pattern here —",
    "The data shows",
  ],
  good: [
    "Good news —",
    "Strong performance:",
    "Here's a highlight —",
  ],
  concern: [
    "Worth noting:",
    "Something to watch:",
    "Heads up —",
  ],
};

const followUps = {
  itinerary: [
    "\n\nWant me to break this down by cabin type or campaign type?",
    "\n\nI can dig deeper into any of these destinations if you'd like.",
    "",
  ],
  cabin: [
    "\n\nShould I show you how this varies by itinerary?",
    "\n\nWant to see the trend over time?",
    "",
  ],
  campaign: [
    "\n\nI can show you which itineraries respond best to each campaign type.",
    "\n\nWant me to identify customers for a reactivation campaign?",
    "",
  ],
  churn: [
    "\n\nI can filter this list by itinerary preference or loyalty tier if that helps.",
    "",
  ],
};

// Pattern definitions for query matching
interface QueryPattern {
  patterns: RegExp[];
  handler: (query: string, context: QueryContext) => ChatMessage;
}

const queryPatterns: QueryPattern[] = [
  // ============ NCL CID PATTERNS (Priority) ============
  
  // Destination quality / traffic quality
  {
    patterns: [
      /destination.*quality/i,
      /quality.*visitor.*traffic/i,
      /highest.*quality.*traffic/i,
      /junk.*traffic.*rate/i,
      /traffic.*quality/i,
      /visitor.*quality/i,
    ],
    handler: handleDestinationQuality,
  },
  // Marketing channel quality
  {
    patterns: [
      /channel.*quality/i,
      /marketing.*channel.*quality/i,
      /channel.*deliver.*quality/i,
      /purchase.*intent.*score/i,
      /channel.*scorecard/i,
      /quality.*scorecard/i,
    ],
    handler: handleChannelQuality,
  },
  // Junk traffic / low quality channels
  {
    patterns: [
      /junk.*traffic/i,
      /low.*quality.*visitor/i,
      /generating.*junk/i,
      /waste.*channel/i,
      /bot.*traffic/i,
      /pinterest.*quality/i,
      /programmatic.*quality/i,
    ],
    handler: handleJunkTraffic,
  },
  // Exotic opportunity (Asia/Australia)
  {
    patterns: [
      /exotic.*opportunity/i,
      /asia.*australia/i,
      /asia.*opportunity/i,
      /australia.*opportunity/i,
      /high.*intent.*(asia|australia)/i,
      /elite.*household/i,
    ],
    handler: handleExoticOpportunity,
  },
  // Relevance premium
  {
    patterns: [
      /relevance.*premium/i,
      /creative.*match/i,
      /aov.*lift/i,
      /matched.*creative/i,
      /creative.*alignment/i,
    ],
    handler: handleRelevancePremium,
  },
  // Guardrail effect
  {
    patterns: [
      /guardrail.*effect/i,
      /retention.*matched/i,
      /retention.*generic/i,
      /creative.*retention/i,
      /europe.*intender/i,
      /hawaii.*intender/i,
    ],
    handler: handleGuardrailEffect,
  },
  // Visitor profiles
  {
    patterns: [
      /visitor.*profile/i,
      /high.*intent.*customer/i,
      /elite.*visitor/i,
      /propensity.*score/i,
      /cart.*abandon/i,
    ],
    handler: handleVisitorProfiles,
  },
  // Revenue leakage / mismatch loss
  {
    patterns: [
      /revenue.*leak/i,
      /revenue.*loss/i,
      /creative.*mismatch/i,
      /losing.*revenue/i,
      /mismatch.*loss/i,
      /how much.*losing/i,
    ],
    handler: handleRevenueLoss,
  },
  // Purchase intent by destination
  {
    patterns: [
      /purchase.*intent.*destination/i,
      /highest.*intent.*score/i,
      /strongest.*intent/i,
      /intent.*by.*destination/i,
    ],
    handler: handlePurchaseIntentByDestination,
  },
  // Dark social / tagging issues
  {
    patterns: [
      /dark.*social/i,
      /unclassified.*traffic/i,
      /tagging.*issue/i,
      /generic.*tag/i,
      /data.*governance/i,
    ],
    handler: handleDarkSocial,
  },
  // Marketing readiness / outreach
  {
    patterns: [
      /ready.*marketing/i,
      /marketing.*outreach/i,
      /customer.*ready/i,
      /outreach.*ready/i,
      /conversion.*rate/i,
    ],
    handler: handleMarketingReadiness,
  },
  
  // ============ LEGACY PATTERNS ============
  
  // ROAS by itinerary
  {
    patterns: [
      /roas.*itinerar/i,
      /roas.*(caribbean|alaska|europe|mediterranean)/i,
      /return.*ad.*spend.*itinerar/i,
    ],
    handler: handleROASByItinerary,
  },
  // ROAS by cabin type
  {
    patterns: [
      /roas.*cabin/i,
      /roas.*(inside|ocean|balcony|suite)/i,
    ],
    handler: handleROASByCabinType,
  },
  // ROAS by campaign type
  {
    patterns: [
      /roas.*(prospecting|reactivation|retargeting)/i,
      /roas.*campaign.*type/i,
    ],
    handler: handleROASByCampaignType,
  },
  // Bookings and revenue by cabin type
  {
    patterns: [
      /booking.*revenue.*cabin/i,
      /cabin.*type.*booking/i,
      /revenue.*cabin/i,
    ],
    handler: handleBookingsRevenueByCabin,
  },
  // Bookings by itinerary
  {
    patterns: [
      /booking.*itinerar/i,
      /itinerar.*booking/i,
    ],
    handler: handleBookingsByItinerary,
  },
  // Campaign type comparison (prospecting vs reactivation)
  {
    patterns: [
      /prospecting.*reactivation/i,
      /reactivation.*prospecting/i,
      /sail.*date.*responsive/i,
      /campaign.*type.*compar/i,
    ],
    handler: handleCampaignTypeComparison,
  },
  // Customer loyalty tiers
  {
    patterns: [
      /loyalty.*tier/i,
      /customer.*tier/i,
      /how many.*customer/i,
    ],
    handler: handleLoyaltyTiers,
  },
  // Customer segments
  {
    patterns: [
      /customer.*segment/i,
      /segment.*breakdown/i,
    ],
    handler: handleCustomerSegments,
  },
  // Churn risk
  {
    patterns: [
      /churn/i,
      /at risk/i,
      /risk.*customer/i,
      /haven't cruised/i,
      /lapsed.*customer/i,
    ],
    handler: handleChurnRisk,
  },
  // LTV by acquisition channel
  {
    patterns: [
      /ltv.*channel/i,
      /lifetime.*value.*channel/i,
      /acquisition.*channel/i,
    ],
    handler: handleLTVByChannel,
  },
  // Revenue over time
  {
    patterns: [
      /revenue.*over.*time/i,
      /revenue.*trend/i,
      /monthly.*revenue/i,
    ],
    handler: handleRevenueOverTime,
  },
  // Bookings over time
  {
    patterns: [
      /booking.*over.*time/i,
      /booking.*trend/i,
      /monthly.*booking/i,
    ],
    handler: handleBookingsOverTime,
  },
  // Why questions (explanatory)
  {
    patterns: [
      /why.*(alaska|caribbean|mediterranean|europe)/i,
      /why.*underperform/i,
      /why.*outperform/i,
    ],
    handler: handleWhyQuestion,
  },
  // High value customers
  {
    patterns: [
      /high.*value.*customer/i,
      /vip.*customer/i,
      /top.*customer/i,
    ],
    handler: handleHighValueCustomers,
  },
  // Overall metrics / summary
  {
    patterns: [
      /overall.*metric/i,
      /summary/i,
      /dashboard/i,
      /overview/i,
    ],
    handler: handleOverallMetrics,
  },
  // Funnel / conversion
  {
    patterns: [
      /funnel/i,
      /conversion.*rate/i,
      /how.*campaign.*convert/i,
      /impression.*booking/i,
      /conversion.*pipeline/i,
    ],
    handler: handleFunnel,
  },
  // Funnel by campaign type
  {
    patterns: [
      /funnel.*(prospecting|reactivation|retargeting)/i,
      /conversion.*(prospecting|reactivation|retargeting)/i,
    ],
    handler: handleFunnelByCampaignType,
  },
  // Audience building
  {
    patterns: [
      /build.*audience/i,
      /create.*audience/i,
      /create.*segment/i,
      /target.*customer/i,
      /find.*customer/i,
      /who.*should.*target/i,
    ],
    handler: handleAudienceBuilder,
  },
  // Audience for specific criteria
  {
    patterns: [
      /audience.*(caribbean|alaska|europe|mediterranean)/i,
      /target.*(caribbean|alaska|europe|mediterranean)/i,
      /(caribbean|alaska|europe|mediterranean).*customer/i,
    ],
    handler: handleAudienceByItinerary,
  },
  // ROI projection
  {
    patterns: [
      /roi.*projection/i,
      /potential.*revenue/i,
      /how much.*make/i,
      /what.*revenue.*expect/i,
      /project.*revenue/i,
      /estimate.*revenue/i,
    ],
    handler: handleROIProjection,
  },
  // Campaign recommendation
  {
    patterns: [
      /recommend.*campaign/i,
      /what.*campaign/i,
      /what.*should.*do/i,
      /how.*target/i,
      /suggest.*campaign/i,
      /best.*approach/i,
    ],
    handler: handleCampaignRecommendation,
  },
  // Reactivation opportunities
  {
    patterns: [
      /reactivat.*opportunit/i,
      /win.*back/i,
      /bring.*back/i,
      /re-?engage/i,
    ],
    handler: handleReactivationOpportunity,
  },
];

// Context-aware follow-up patterns
const followUpPatterns: QueryPattern[] = [
  {
    patterns: [/break.*down.*cabin/i, /by cabin/i],
    handler: handleBreakdownByCabin,
  },
  {
    patterns: [/break.*down.*itinerar/i, /by itinerar/i],
    handler: handleBreakdownByItinerary,
  },
  {
    patterns: [/exclude.*(alaska|caribbean|mediterranean|europe)/i],
    handler: handleExcludeItinerary,
  },
  {
    patterns: [/compare.*last.*year/i, /year.*over.*year/i, /yoy/i],
    handler: handleYoYComparison,
  },
];

export function processQuery(query: string, context: QueryContext): { message: ChatMessage; newContext: QueryContext } {
  const normalizedQuery = query.toLowerCase().trim();

  // Check for follow-up patterns first if we have context
  if (context.lastQuery) {
    for (const pattern of followUpPatterns) {
      if (pattern.patterns.some((p) => p.test(normalizedQuery))) {
        const message = pattern.handler(query, context);
        return {
          message,
          newContext: {
            ...context,
            lastQuery: query,
          },
        };
      }
    }
  }

  // Check main patterns
  for (const pattern of queryPatterns) {
    if (pattern.patterns.some((p) => p.test(normalizedQuery))) {
      const message = pattern.handler(query, context);
      return {
        message,
        newContext: {
          lastQuery: query,
          lastDimension: extractDimension(query),
          lastMetric: extractMetric(query),
        },
      };
    }
  }

  // Default response
  return {
    message: createMessage(
      "I can help you analyze your campaign performance data. Try asking about:\n\n• ROAS by itinerary, cabin type, or campaign type\n• Bookings and revenue breakdowns\n• Customer segments and loyalty tiers\n• Churn risk analysis\n• Revenue trends over time",
      undefined,
      []
    ),
    newContext: context,
  };
}

// ============ HANDLER FUNCTIONS ============

function handleROASByItinerary(query: string, context: QueryContext): ChatMessage {
  const data = queryEngine.getROASByItinerary();
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  
  const opening = pickRandom(openings.analysis);
  const followUp = pickRandom(followUps.itinerary);

  return createMessage(
    `${opening} ${best.label} is your top performer at ${best.value}x ROAS, with Mediterranean close behind at 3.8x. ${worst.label} is lagging at ${worst.value}x — this is often due to campaign mix and cabin type skew toward Inside cabins.${followUp}`,
    {
      type: "bar",
      title: "ROAS by Itinerary",
      data,
      yKey: "roas",
    },
    [
      { id: "export-roas", label: "Export CSV", icon: "download", action: "export_csv" },
      { id: "schedule-roas", label: "Schedule Report", icon: "calendar", action: "schedule_report" },
    ]
  );
}

function handleROASByCabinType(query: string, context: QueryContext): ChatMessage {
  const data = queryEngine.getROASByCabinType();
  const best = data.reduce((a, b) => (a.value > b.value ? a : b));

  return createMessage(
    `${best.label} cabins deliver the highest ROAS at ${best.value.toFixed(1)}x, driven by their premium pricing. Suite bookings, while fewer in volume, generate outsized returns due to high average order value.`,
    {
      type: "bar",
      title: "ROAS by Cabin Type",
      data,
      yKey: "roas",
    },
    [
      { id: "export-cabin-roas", label: "Export CSV", icon: "download", action: "export_csv" },
    ]
  );
}

function handleROASByCampaignType(query: string, context: QueryContext): ChatMessage {
  const data = queryEngine.getROASByCampaignType();
  const reactivation = data.find((d) => d.label === "Reactivation");
  const prospecting = data.find((d) => d.label === "Prospecting");

  return createMessage(
    `Reactivation campaigns deliver ${reactivation?.value.toFixed(1)}x ROAS—significantly outperforming Prospecting at ${prospecting?.value.toFixed(1)}x. This suggests an opportunity to shift more budget toward re-engaging lapsed customers.`,
    {
      type: "bar",
      title: "ROAS by Campaign Type",
      data,
      yKey: "roas",
    },
    [
      { id: "export-campaign-roas", label: "Export CSV", icon: "download", action: "export_csv" },
    ]
  );
}

function handleBookingsRevenueByCabin(query: string, context: QueryContext): ChatMessage {
  const bookings = queryEngine.getBookingsByCabinType();
  const revenue = queryEngine.getRevenueByCabinType();

  // Combine into metrics
  const metrics: MetricData[] = bookings.map((b, i) => ({
    label: b.label,
    value: `${b.value} / $${(revenue[i].value / 1000000).toFixed(1)}M`,
    changeLabel: "bookings / revenue",
  }));

  return createMessage(
    `Inside cabins lead in volume with ${bookings[0].value} bookings, while Suites generate the highest revenue per booking. Balcony cabins offer a strong balance of volume and value.`,
    {
      type: "bar",
      title: "Revenue by Cabin Type",
      data: revenue.map((r) => ({ ...r, value: Math.round(r.value / 1000) })),
      yKey: "revenue",
    },
    [
      { id: "export-cabin", label: "Export CSV", icon: "download", action: "export_csv" },
    ]
  );
}

function handleBookingsByItinerary(query: string, context: QueryContext): ChatMessage {
  const data = queryEngine.getBookingsByItinerary();
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const best = data.reduce((a, b) => (a.value > b.value ? a : b));

  return createMessage(
    `${best.label} accounts for ${Math.round((best.value / total) * 100)}% of all bookings (${best.value} of ${total} total). This reflects both consumer demand and our campaign focus on this popular destination.`,
    {
      type: "bar",
      title: "Bookings by Itinerary",
      data,
    },
    [
      { id: "export-itinerary", label: "Export CSV", icon: "download", action: "export_csv" },
    ]
  );
}

function handleCampaignTypeComparison(query: string, context: QueryContext): ChatMessage {
  const roasData = queryEngine.getROASByCampaignType();
  const bookingsData = queryEngine.getBookingsByCampaignType();
  
  const prospectingROAS = roasData.find((d) => d.label === "Prospecting")?.value || 0;
  const reactivationROAS = roasData.find((d) => d.label === "Reactivation")?.value || 0;
  const ratio = (reactivationROAS / prospectingROAS).toFixed(1);
  
  const opening = pickRandom(openings.analysis);
  const followUp = pickRandom(followUps.campaign);

  const metrics: MetricData[] = [
    { label: "Prospecting ROAS", value: `${prospectingROAS.toFixed(1)}x` },
    { label: "Reactivation ROAS", value: `${reactivationROAS.toFixed(1)}x` },
    { label: "Prospecting Bookings", value: bookingsData.find((d) => d.label === "Prospecting")?.value || 0 },
    { label: "Reactivation Bookings", value: bookingsData.find((d) => d.label === "Reactivation")?.value || 0 },
  ];

  return createMessage(
    `${opening} Reactivation is crushing it — ${ratio}x more efficient than Prospecting. That makes sense: you're reaching people who already know and like you.\n\nFor high-demand sail dates, lean into Reactivation to maximize revenue per dollar spent.${followUp}`,
    {
      type: "metrics",
      data: metrics,
    },
    [
      { id: "create-reactivation", label: "Create Reactivation Audience", icon: "users", action: "create_audience" },
    ]
  );
}

function handleLoyaltyTiers(query: string, context: QueryContext): ChatMessage {
  const data = queryEngine.getCustomersByLoyaltyTier();
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return createMessage(
    `Your customer base of ${total} is primarily Bronze tier (${data[0].value}), with ${data[3].value} Platinum members representing your most valuable segment. Consider tier-specific campaigns to drive upgrades.`,
    {
      type: "bar",
      title: "Customers by Loyalty Tier",
      data,
    },
    [
      { id: "export-tiers", label: "Export CSV", icon: "download", action: "export_csv" },
    ]
  );
}

function handleCustomerSegments(query: string, context: QueryContext): ChatMessage {
  const data = queryEngine.getCustomersBySegment();

  return createMessage(
    `Your customer base includes ${data.find((d) => d.label === "Active")?.value} Active customers and ${data.find((d) => d.label === "VIP")?.value} VIPs. The ${data.find((d) => d.label === "Lapsed")?.value} Lapsed customers represent a significant reactivation opportunity.`,
    {
      type: "bar",
      title: "Customers by Segment",
      data,
    },
    [
      { id: "target-lapsed", label: "Target Lapsed Segment", icon: "users", action: "create_audience" },
    ]
  );
}

function handleChurnRisk(query: string, context: QueryContext): ChatMessage {
  const churnCustomers = getChurnRiskCustomers(18);
  const highValueLapsed = getHighValueLapsedCustomers();
  
  const opening = pickRandom(openings.concern);
  const followUp = pickRandom(followUps.churn);

  const tableData: TableData = {
    columns: [
      { key: "name", label: "Customer" },
      { key: "loyaltyTier", label: "Tier" },
      { key: "lifetimeValue", label: "LTV" },
      { key: "lastCruiseDate", label: "Last Cruise" },
      { key: "preferredItinerary", label: "Preferred Itinerary" },
    ],
    rows: churnCustomers.slice(0, 10).map((c) => ({
      name: `${c.firstName} ${c.lastName}`,
      loyaltyTier: c.loyaltyTier,
      lifetimeValue: c.lifetimeValue,
      lastCruiseDate: c.lastCruiseDate,
      preferredItinerary: c.preferredItinerary,
    })),
  };

  return createMessage(
    `${opening} I found ${churnCustomers.length} customers who haven't sailed in 18+ months but have solid lifetime value — they're at risk of churning. ${highValueLapsed.length} of them have LTV over $15k, so they're worth prioritizing.\n\nA personalized win-back campaign based on their preferred itinerary could bring them back.${followUp}`,
    {
      type: "table",
      title: "High Churn Risk Customers",
      data: tableData,
    },
    [
      { id: "create-winback", label: `Create Win-Back Audience (${churnCustomers.length})`, icon: "users", action: "create_audience", payload: { count: churnCustomers.length } },
      { id: "export-churn", label: "Export Full List", icon: "download", action: "export_csv" },
    ]
  );
}

function handleLTVByChannel(query: string, context: QueryContext): ChatMessage {
  const data = queryEngine.getLTVByAcquisitionChannel();
  const best = data.reduce((a, b) => (a.value > b.value ? a : b));

  return createMessage(
    `Customers acquired via ${best.label} have the highest average LTV at $${best.value.toLocaleString()}. This suggests ${best.label} attracts higher-intent prospects who convert to repeat cruisers.`,
    {
      type: "bar",
      title: "Average LTV by Acquisition Channel",
      data,
      yKey: "revenue",
    },
    [
      { id: "export-ltv", label: "Export CSV", icon: "download", action: "export_csv" },
    ]
  );
}

function handleRevenueOverTime(query: string, context: QueryContext): ChatMessage {
  const data = queryEngine.getRevenueOverTime(12);

  return createMessage(
    `Revenue shows strong seasonality with peaks in Q4 and Q1, driven by holiday booking and new year promotions. The trend is positive year-over-year.`,
    {
      type: "line",
      title: "Monthly Revenue (Last 12 Months)",
      data: data.map((d) => ({ ...d, value: Math.round(d.value / 1000) })),
      yKey: "revenue",
    },
    [
      { id: "export-revenue-trend", label: "Export CSV", icon: "download", action: "export_csv" },
    ]
  );
}

function handleBookingsOverTime(query: string, context: QueryContext): ChatMessage {
  const data = queryEngine.getBookingsOverTime(12);

  return createMessage(
    `Booking volume tracks closely with revenue, with consistent performance across most months. Q4 campaigns drove a notable spike in booking activity.`,
    {
      type: "line",
      title: "Monthly Bookings (Last 12 Months)",
      data,
    },
    [
      { id: "export-booking-trend", label: "Export CSV", icon: "download", action: "export_csv" },
    ]
  );
}

function handleWhyQuestion(query: string, context: QueryContext): ChatMessage {
  const normalizedQuery = query.toLowerCase();

  if (normalizedQuery.includes("alaska") && (normalizedQuery.includes("underperform") || normalizedQuery.includes("low"))) {
    return createMessage(
      `Alaska's lower ROAS can be attributed to several factors:\n\n1. **Campaign Mix**: Alaska campaigns ran 60% Prospecting vs 40% Reactivation. Prospecting typically delivers 0.6x lower ROAS.\n\n2. **Cabin Mix**: Alaska sailings are 45% Inside cabins, which have the lowest AOV ($2,400 avg vs $4,200 for Balcony).\n\n3. **Seasonality**: Alaska is a seasonal destination (May-Sept), limiting campaign optimization windows.\n\n**Recommendation**: Shift Alaska budget toward Reactivation campaigns targeting past Alaska cruisers, and promote Balcony cabin upgrades.`,
      undefined,
      [
        { id: "alaska-reactivation", label: "Create Alaska Reactivation Audience", icon: "users", action: "create_audience" },
      ]
    );
  }

  if (normalizedQuery.includes("mediterranean") && normalizedQuery.includes("outperform")) {
    return createMessage(
      `Mediterranean's strong performance is driven by:\n\n1. **Premium Cabin Mix**: 40% of Mediterranean bookings are Balcony or Suite, vs 25% for other itineraries.\n\n2. **Reactivation Success**: Q4 2024 Mediterranean Reactivation campaign achieved 5.2x ROAS by targeting customers with Mediterranean preference.\n\n3. **Higher AOV**: Mediterranean average order value is $5,100—22% above portfolio average.\n\n**Recommendation**: Expand Mediterranean Reactivation campaigns and test Suite-focused creative.`,
      undefined,
      [
        { id: "med-suite", label: "Create Mediterranean Suite Audience", icon: "users", action: "create_audience" },
      ]
    );
  }

  // Generic why response
  return createMessage(
    `To provide a detailed explanation, I'd need to know which specific metric or comparison you'd like me to analyze. Try asking:\n\n• "Why is Alaska underperforming?"\n• "Why does Reactivation outperform Prospecting?"\n• "Why did Mediterranean revenue increase?"`,
    undefined,
    []
  );
}

function handleHighValueCustomers(query: string, context: QueryContext): ChatMessage {
  const metrics = queryEngine.getOverallMetrics();

  return createMessage(
    `Your ${metrics.activeCustomers} active customers (including VIPs) represent your most engaged segment. VIP customers average 8+ cruises and $50k+ lifetime value.`,
    {
      type: "metrics",
      data: [
        { label: "Total Customers", value: metrics.totalCustomers },
        { label: "Active + VIP", value: metrics.activeCustomers },
        { label: "Avg Order Value", value: `$${metrics.averageOrderValue.toLocaleString()}` },
        { label: "Overall ROAS", value: `${metrics.overallROAS}x` },
      ],
    },
    [
      { id: "export-vip", label: "Export VIP List", icon: "download", action: "export_csv" },
    ]
  );
}

function handleOverallMetrics(query: string, context: QueryContext): ChatMessage {
  const metrics = queryEngine.getOverallMetrics();

  return createMessage(
    `Here's your campaign performance summary. Total attributed revenue is $${(metrics.totalRevenue / 1000000).toFixed(1)}M from ${metrics.attributedBookings} NaviStone-attributed bookings, delivering ${metrics.overallROAS}x overall ROAS.`,
    {
      type: "metrics",
      data: [
        { label: "Total Bookings", value: metrics.totalBookings },
        { label: "Attributed Bookings", value: metrics.attributedBookings },
        { label: "Total Revenue", value: `$${(metrics.totalRevenue / 1000000).toFixed(1)}M` },
        { label: "Ad Spend", value: `$${(metrics.totalSpend / 1000).toFixed(0)}k` },
        { label: "Overall ROAS", value: `${metrics.overallROAS}x` },
        { label: "Avg Order Value", value: `$${metrics.averageOrderValue.toLocaleString()}` },
      ],
    },
    [
      { id: "export-summary", label: "Export Summary", icon: "download", action: "export_csv" },
      { id: "schedule-summary", label: "Schedule Weekly Report", icon: "calendar", action: "schedule_report" },
    ]
  );
}

// ============ FUNNEL HANDLERS ============

function handleFunnel(query: string, context: QueryContext): ChatMessage {
  const funnelData = getFunnelData();
  const overallConversion = funnelData.length > 0 
    ? ((funnelData[funnelData.length - 1].count / funnelData[0].count) * 100).toFixed(2)
    : "0";
  
  return createMessage(
    `Here's your campaign conversion funnel. From ${funnelData[0]?.count.toLocaleString()} impressions, you're seeing ${funnelData[1]?.count.toLocaleString()} site visits (${funnelData[0]?.conversionRate?.toFixed(1)}% visit rate) and ${funnelData[2]?.count.toLocaleString()} bookings (${overallConversion}% end-to-end conversion).\n\nThis is solid for direct mail — industry average is around 0.2-0.3% end-to-end.`,
    {
      type: "funnel",
      title: "Campaign Conversion Funnel",
      data: funnelData,
    },
    [
      { id: "export-funnel", label: "Export Funnel Data", icon: "download", action: "export_csv" },
    ]
  );
}

function handleFunnelByCampaignType(query: string, context: QueryContext): ChatMessage {
  const normalizedQuery = query.toLowerCase();
  
  let campaignType: "Prospecting" | "Reactivation" | "Retargeting" = "Reactivation";
  if (normalizedQuery.includes("prospecting")) campaignType = "Prospecting";
  else if (normalizedQuery.includes("retargeting")) campaignType = "Retargeting";
  
  const funnelData = getFunnelByCampaignType(campaignType);
  const overallConversion = funnelData.length > 0 && funnelData[0].count > 0
    ? ((funnelData[funnelData.length - 1].count / funnelData[0].count) * 100).toFixed(2)
    : "0";
  
  const insights: Record<typeof campaignType, string> = {
    Prospecting: "Prospecting has the lowest conversion rate but brings in new customers who become repeat cruisers.",
    Reactivation: "Reactivation campaigns convert best because you're reaching people who already know and love your brand.",
    Retargeting: "Retargeting catches people who showed intent — they visited your site but didn't book yet.",
  };
  
  return createMessage(
    `${campaignType} funnel: ${funnelData[0]?.count.toLocaleString()} impressions → ${funnelData[1]?.count.toLocaleString()} visits → ${funnelData[2]?.count.toLocaleString()} bookings.\n\n${insights[campaignType]}\n\nEnd-to-end conversion: ${overallConversion}%`,
    {
      type: "funnel",
      title: `${campaignType} Conversion Funnel`,
      data: funnelData,
    },
    [
      { id: "export-funnel-type", label: "Export Data", icon: "download", action: "export_csv" },
    ]
  );
}

// ============ AUDIENCE BUILDER HANDLERS ============

function handleAudienceBuilder(query: string, context: QueryContext): ChatMessage {
  const normalizedQuery = query.toLowerCase();
  
  // Determine criteria from query
  const criteria: AudienceCriteria = {};
  
  // Check for segment mentions
  if (normalizedQuery.includes("lapsed")) {
    criteria.segment = ["Lapsed"];
  } else if (normalizedQuery.includes("active")) {
    criteria.segment = ["Active"];
  } else if (normalizedQuery.includes("vip")) {
    criteria.segment = ["VIP"];
  }
  
  // Check for loyalty tier
  if (normalizedQuery.includes("platinum")) {
    criteria.loyaltyTier = ["Platinum"];
  } else if (normalizedQuery.includes("gold")) {
    criteria.loyaltyTier = ["Gold"];
  } else if (normalizedQuery.includes("silver")) {
    criteria.loyaltyTier = ["Silver"];
  }
  
  // Check for LTV mentions
  if (normalizedQuery.includes("high value") || normalizedQuery.includes("high-value")) {
    criteria.minLTV = 10000;
  }
  
  // Check for churn risk
  if (normalizedQuery.includes("churn") || normalizedQuery.includes("at risk")) {
    criteria.churnRisk = true;
    criteria.segment = ["Lapsed"];
  }
  
  // Check for itinerary
  if (normalizedQuery.includes("caribbean")) {
    criteria.preferredItinerary = ["Caribbean"];
  } else if (normalizedQuery.includes("alaska")) {
    criteria.preferredItinerary = ["Alaska"];
  } else if (normalizedQuery.includes("mediterranean")) {
    criteria.preferredItinerary = ["Mediterranean"];
  } else if (normalizedQuery.includes("europe")) {
    criteria.preferredItinerary = ["Europe"];
  }
  
  // Default to reactivation audience if no specific criteria
  if (Object.keys(criteria).length === 0) {
    criteria.segment = ["Lapsed"];
    criteria.minLTV = 5000;
  }
  
  const audienceData = buildAudience(criteria);
  
  // Get full customer list for ROI and recommendations
  let filteredCustomers = [...customers];
  if (criteria.segment) {
    filteredCustomers = filteredCustomers.filter(c => criteria.segment!.includes(c.segment));
  }
  if (criteria.loyaltyTier) {
    filteredCustomers = filteredCustomers.filter(c => criteria.loyaltyTier!.includes(c.loyaltyTier));
  }
  if (criteria.minLTV) {
    filteredCustomers = filteredCustomers.filter(c => c.lifetimeValue >= criteria.minLTV!);
  }
  if (criteria.preferredItinerary) {
    filteredCustomers = filteredCustomers.filter(c => criteria.preferredItinerary!.includes(c.preferredItinerary));
  }
  if (criteria.churnRisk) {
    const cutoffDate = new Date("2025-02-01");
    cutoffDate.setMonth(cutoffDate.getMonth() - 18);
    filteredCustomers = filteredCustomers.filter(c => new Date(c.lastCruiseDate) < cutoffDate);
  }
  
  // Add ROI projection and recommendation
  const roiProjection = calculateROIProjection(filteredCustomers, "Reactivation");
  const recommendation = generateCampaignRecommendation(filteredCustomers);
  
  const enrichedData: AudiencePreviewData = {
    ...audienceData,
    roiProjection,
    recommendation,
  };
  
  return createMessage(
    `I found ${audienceData.count} customers matching your criteria. Here's a preview with ROI projection and campaign recommendations.`,
    {
      type: "audience_preview",
      title: "Audience Preview",
      data: enrichedData,
    },
    [] // Actions are built into the audience preview component
  );
}

function handleAudienceByItinerary(query: string, context: QueryContext): ChatMessage {
  const normalizedQuery = query.toLowerCase();
  
  let itinerary: "Caribbean" | "Alaska" | "Europe" | "Mediterranean" = "Caribbean";
  if (normalizedQuery.includes("alaska")) itinerary = "Alaska";
  else if (normalizedQuery.includes("mediterranean")) itinerary = "Mediterranean";
  else if (normalizedQuery.includes("europe")) itinerary = "Europe";
  
  const audienceData = getAudienceForItinerary(itinerary);
  
  // Get full customer list
  const filteredCustomers = customers.filter(c => 
    c.preferredItinerary === itinerary && 
    (c.segment === "Lapsed" || c.segment === "Active")
  );
  
  const roiProjection = calculateROIProjection(filteredCustomers, "Reactivation");
  const recommendation = generateCampaignRecommendation(filteredCustomers);
  
  const enrichedData: AudiencePreviewData = {
    ...audienceData,
    roiProjection,
    recommendation,
  };
  
  return createMessage(
    `Here are ${audienceData.count} customers who prefer ${itinerary} cruises. The majority are either Active or Lapsed — perfect for a targeted campaign.`,
    {
      type: "audience_preview",
      title: `${itinerary} Preference Audience`,
      data: enrichedData,
    },
    []
  );
}

// ============ ROI PROJECTION HANDLERS ============

function handleROIProjection(query: string, context: QueryContext): ChatMessage {
  // Use reactivation audience as default
  const audienceData = getAudienceForReactivation();
  
  const filteredCustomers = customers.filter(c => 
    c.segment === "Lapsed" && 
    c.lifetimeValue >= 8000
  ).filter(c => {
    const cutoffDate = new Date("2025-02-01");
    cutoffDate.setMonth(cutoffDate.getMonth() - 18);
    return new Date(c.lastCruiseDate) < cutoffDate;
  });
  
  const roiProjection = calculateROIProjection(filteredCustomers, "Reactivation");
  
  return createMessage(
    `Based on your reactivation audience of ${roiProjection.audienceSize} customers:\n\n**Realistic scenario** (${(roiProjection.historicalResponseRate * 100).toFixed(1)}% response rate):\n• Expected bookings: ${Math.round(roiProjection.audienceSize * roiProjection.historicalResponseRate)}\n• Projected revenue: **$${roiProjection.realisticRevenue.toLocaleString()}**\n• Campaign cost: $${roiProjection.estimatedCost.toLocaleString()}\n• Estimated ROI: **${roiProjection.estimatedROI.toFixed(1)}x**\n\n**Optimistic scenario** (10% response rate):\n• Projected revenue: $${roiProjection.optimisticRevenue.toLocaleString()}\n\nAverage order value for this audience: $${roiProjection.avgOrderValue.toLocaleString()}`,
    {
      type: "metrics",
      data: [
        { label: "Audience Size", value: roiProjection.audienceSize },
        { label: "Avg Order Value", value: `$${roiProjection.avgOrderValue.toLocaleString()}` },
        { label: "Realistic Revenue", value: `$${roiProjection.realisticRevenue.toLocaleString()}` },
        { label: "Estimated ROI", value: `${roiProjection.estimatedROI.toFixed(1)}x` },
      ],
    },
    [
      { id: "create-roi-audience", label: "Create This Audience", icon: "users", action: "create_audience" },
      { id: "launch-campaign-roi", label: "Launch Campaign", icon: "rocket", action: "launch_campaign" },
    ]
  );
}

// ============ CAMPAIGN RECOMMENDATION HANDLERS ============

function handleCampaignRecommendation(query: string, context: QueryContext): ChatMessage {
  // Use high-value lapsed as the default target audience
  const audienceData = getAudienceForHighValueLapsed();
  
  const filteredCustomers = customers.filter(c => 
    c.segment === "Lapsed" && 
    c.lifetimeValue >= 15000
  );
  
  const recommendation = generateCampaignRecommendation(filteredCustomers);
  const roiProjection = calculateROIProjection(filteredCustomers, recommendation.campaignType);
  
  const confidenceEmoji = recommendation.confidence === "high" ? "High" : 
    recommendation.confidence === "medium" ? "Medium" : "Low";
  
  return createMessage(
    `**Campaign Recommendation** (${confidenceEmoji} confidence)\n\n**Type:** ${recommendation.campaignType} via ${recommendation.channel}\n\n**Messaging:** ${recommendation.messaging}\n\n**Why this approach:** ${recommendation.rationale}\n\n**Expected response rate:** ${(recommendation.expectedResponseRate * 100).toFixed(1)}%\n\nFor an audience of ${filteredCustomers.length} high-value lapsed customers, this could generate **$${roiProjection.realisticRevenue.toLocaleString()}** in projected revenue.`,
    {
      type: "audience_preview",
      data: {
        ...audienceData,
        roiProjection,
        recommendation,
      },
    },
    []
  );
}

function handleReactivationOpportunity(query: string, context: QueryContext): ChatMessage {
  const audienceData = getAudienceForReactivation();
  
  const filteredCustomers = customers.filter(c => 
    c.segment === "Lapsed" && 
    c.lifetimeValue >= 8000
  ).filter(c => {
    const cutoffDate = new Date("2025-02-01");
    cutoffDate.setMonth(cutoffDate.getMonth() - 18);
    return new Date(c.lastCruiseDate) < cutoffDate;
  });
  
  const recommendation = generateReactivationRecommendation(filteredCustomers);
  const roiProjection = calculateROIProjection(filteredCustomers, "Reactivation");
  
  return createMessage(
    `Great question! I found **${filteredCustomers.length}** customers who are prime reactivation candidates — they have solid lifetime value ($8k+) but haven't sailed in 18+ months.\n\nThese lapsed customers are worth pursuing because reactivation campaigns typically deliver 2-3x better ROAS than prospecting.`,
    {
      type: "audience_preview",
      data: {
        ...audienceData,
        roiProjection,
        recommendation,
      },
    },
    []
  );
}

// ============ FOLLOW-UP HANDLERS ============

function handleBreakdownByCabin(query: string, context: QueryContext): ChatMessage {
  const data = queryEngine.getROASByCabinType();

  return createMessage(
    `Breaking down by cabin type: Suite cabins lead with ${data.find((d) => d.label === "Suite")?.value.toFixed(1)}x ROAS, though they represent lower volume. Balcony offers the best balance of volume and return.`,
    {
      type: "bar",
      title: "ROAS by Cabin Type",
      data,
      yKey: "roas",
    },
    [
      { id: "export-cabin-breakdown", label: "Export CSV", icon: "download", action: "export_csv" },
    ]
  );
}

function handleBreakdownByItinerary(query: string, context: QueryContext): ChatMessage {
  const data = queryEngine.getROASByItinerary();

  return createMessage(
    `Breaking down by itinerary: Caribbean and Mediterranean are your top performers, while Alaska lags behind due to seasonal constraints and cabin mix.`,
    {
      type: "bar",
      title: "ROAS by Itinerary",
      data,
      yKey: "roas",
    },
    [
      { id: "export-itinerary-breakdown", label: "Export CSV", icon: "download", action: "export_csv" },
    ]
  );
}

function handleExcludeItinerary(query: string, context: QueryContext): ChatMessage {
  // This would filter the previous query results
  return createMessage(
    `I've excluded that itinerary from the analysis. In a production system, this would dynamically filter the previous results. For this prototype, try asking a new question with the specific itineraries you want to include.`,
    undefined,
    []
  );
}

function handleYoYComparison(query: string, context: QueryContext): ChatMessage {
  return createMessage(
    `Year-over-year comparison: Q1 2025 bookings are tracking 18% ahead of Q1 2024, with revenue up 22% due to stronger Suite and Balcony mix. Reactivation campaigns are driving the majority of this growth.\n\n*Note: Full YoY comparison requires 2023 data which is not included in this prototype dataset.*`,
    {
      type: "metrics",
      data: [
        { label: "YoY Bookings", value: "+18%", change: 18 },
        { label: "YoY Revenue", value: "+22%", change: 22 },
        { label: "YoY ROAS", value: "+0.3x", change: 8 },
        { label: "YoY AOV", value: "+4%", change: 4 },
      ],
    },
    []
  );
}

// ============ NCL CID HANDLERS ============

function handleDestinationQuality(query: string, context: QueryContext): ChatMessage {
  const destinations = getDestinationQuality();
  
  // Sort by propensity score for display
  const sortedByQuality = [...destinations].sort((a, b) => b.avgPropensityScore - a.avgPropensityScore);
  
  const chartData: ChartDataPoint[] = sortedByQuality.map(d => ({
    label: d.destination,
    value: d.avgPropensityScore,
  }));
  
  const tableData: TableData = {
    columns: [
      { key: "destination", label: "Destination" },
      { key: "eliteHouseholds", label: "Elite Households" },
      { key: "avgScore", label: "Avg Propensity Score" },
      { key: "matchRate", label: "Creative Match Rate" },
      { key: "status", label: "Status" },
    ],
    rows: sortedByQuality.map(d => ({
      destination: d.destination,
      eliteHouseholds: d.eliteHouseholds.toLocaleString(),
      avgScore: d.avgPropensityScore.toFixed(2),
      matchRate: `${d.currentMatchRate}%`,
      status: d.currentMatchRate === 0 ? "🔴 100% Leakage" : d.currentMatchRate < 50 ? "🟡 Partial Match" : "🟢 Good Match",
    })),
  };
  
  return createMessage(
    `**Visitor Traffic Quality by Destination**\n\nThe data reveals a critical finding: **Asia and Australia have the highest quality visitors** with an average propensity score of **6.18** — these are cart abandoners ready to book. However, they're receiving **0% matched creative**, resulting in 100% revenue leakage.\n\nMeanwhile, Caribbean (your default creative) has high volume but lower quality scores. The "Exotic" destinations represent your highest-intent traffic being completely ignored.\n\n*This analysis is powered by NCL's proprietary E-Commerce Propensity Model, continuously trained on visitor session data.*`,
    {
      type: "table",
      title: "Destination Quality Analysis",
      data: tableData,
    },
    [
      { id: "view-exotic", label: "View Exotic Opportunity", icon: "users", action: "create_audience" },
      { id: "export-quality", label: "Export Analysis", icon: "download", action: "export_csv" },
    ]
  );
}

function handleChannelQuality(query: string, context: QueryContext): ChatMessage {
  const channels = getChannelQuality();
  
  // Sort by elite rate
  const sorted = [...channels].sort((a, b) => b.eliteRate - a.eliteRate);
  
  const chartData: ChartDataPoint[] = sorted.map(c => ({
    label: c.channel,
    value: c.eliteRate,
  }));
  
  const tableData: TableData = {
    columns: [
      { key: "channel", label: "Channel" },
      { key: "eliteRate", label: "Elite Rate" },
      { key: "junkRate", label: "Junk Rate" },
      { key: "visitors", label: "Total Visitors" },
      { key: "verdict", label: "Verdict" },
    ],
    rows: sorted.map(c => ({
      channel: c.channel,
      eliteRate: `${c.eliteRate.toFixed(1)}%`,
      junkRate: `${c.junkRate.toFixed(1)}%`,
      visitors: c.totalVisitors.toLocaleString(),
      verdict: c.verdict,
    })),
  };
  
  return createMessage(
    `**Marketing Channel Quality Scorecard**\n\nThe forensic audit reveals massive variance in channel quality:\n\n**High Performers:**\n• **Email (CRM)**: 46.1% Elite Rate — your benchmark for quality\n• **Google Search**: 40.1% Elite Rate — the workhorse, delivering 13.7M visitors at near-CRM quality\n\n**Waste Channels (Fund the Fix):**\n• **Pinterest**: 1.7% Elite / **95.2% Junk** — statistically indistinguishable from bots\n• **Programmatic Display**: 1.6% Elite / 46% Junk — 98.4% of budget wasted\n\nCutting Pinterest and Display waste can fund the Exotic creative build without net-new budget.`,
    {
      type: "table",
      title: "Channel Quality Scorecard",
      data: tableData,
    },
    [
      { id: "view-waste", label: "View Waste Channels", icon: "settings", action: "refine_audience" },
      { id: "export-channels", label: "Export Scorecard", icon: "download", action: "export_csv" },
    ]
  );
}

function handleJunkTraffic(query: string, context: QueryContext): ChatMessage {
  const lowQuality = getLowQualityChannels();
  const darkSocial = getDarkSocialMetrics();
  
  const chartData: ChartDataPoint[] = lowQuality.map(c => ({
    label: c.channel,
    value: c.junkRate,
  }));
  
  const metrics: MetricData[] = [
    { label: "Pinterest Junk Rate", value: "95.2%", change: -95 },
    { label: "Programmatic Display Junk", value: "46%", change: -46 },
    { label: "TikTok Junk Rate", value: "78%", change: -78 },
    { label: "Unclassified/Dark Social", value: "69.6%", change: -70 },
  ];
  
  return createMessage(
    `**Low-Quality Traffic Sources — The "Bot Tax"**\n\n🚨 **Critical Finding:** You're paying for traffic that will never convert.\n\n**Pinterest** has a **95.2% Junk Rate** — this suggests the channel is overrun by bots, scrapers, or accidental clicks. A 95% failure rate is statistically anomalous for human traffic.\n\n**Programmatic Display** delivers only **1.6% Elite visitors** — for every 100 clicks you pay for, only 1.6 represent a qualified prospect.\n\n**The "Dark Social" Problem:** ${darkSocial.unclassifiedVisitors.toLocaleString()} visitors are trapped in an "Unclassified" bucket due to tagging failures, with a **${darkSocial.junkRateInUnclassified}% junk rate**. These campaigns are invisible to optimization.\n\n**Recommendation:** Cut these channels to fund the Exotic creative build — this is mathematically risk-free.`,
    {
      type: "bar",
      title: "Junk Traffic Rate by Channel",
      data: chartData,
    },
    [
      { id: "cut-waste", label: "View Reallocation Plan", icon: "settings", action: "refine_audience" },
      { id: "export-junk", label: "Export Analysis", icon: "download", action: "export_csv" },
    ]
  );
}

function handleExoticOpportunity(query: string, context: QueryContext): ChatMessage {
  const exotic = getExoticOpportunity();
  const asiaProfiles = getVisitorProfiles().filter(v => v.destinationIntent === "Asia" || v.destinationIntent === "Australia");
  
  const metrics: MetricData[] = [
    { label: "Total Elite Households", value: exotic.totalEliteHouseholds.toLocaleString() },
    { label: "Avg Propensity Score", value: exotic.avgPropensityScore.toFixed(2) },
    { label: "Estimated Demand Value", value: `$${(exotic.totalDemandValue / 1000000).toFixed(0)}M` },
    { label: "Current Match Rate", value: `${exotic.currentMatchRate}%` },
    { label: "Revenue Leakage", value: "100%" },
  ];
  
  return createMessage(
    `**The "Exotic" Black Hole — $500M+ Opportunity**\n\n🚨 **Critical Finding:** NCL is sitting on **${exotic.totalEliteHouseholds.toLocaleString()} Elite Households** looking for Asia and Australia cruises, but **100% are receiving generic Caribbean creative**.\n\n**The Numbers:**\n• Asia (Japan): **${exotic.asiaHouseholds.toLocaleString()}** Elite Households\n• Australia: **${exotic.australiaHouseholds.toLocaleString()}** Elite Households\n• Average Propensity Score: **${exotic.avgPropensityScore}** (correlates with cart abandonment — ready to buy)\n\n**The Tragedy:** These visitors have the highest intent in your database. A score of 6.18 means they've selected a ship, picked a cabin, and viewed pricing. They walked up to the counter with a credit card and were ignored.\n\n**Root Cause:** NCL lacks creative assets for Asia/Australia. The system defaults 100% of this high-value traffic to generic Caribbean creative — the marketing equivalent of serving a hot dog to a guest who ordered lobster.\n\n*The model automatically identifies these "Elite" households (Score > 2.25) as new data flows in.*`,
    {
      type: "metrics",
      data: metrics,
    },
    [
      { id: "build-exotic", label: "View Exotic Households", icon: "users", action: "create_audience" },
      { id: "export-exotic", label: "Export List", icon: "download", action: "export_csv" },
    ]
  );
}

function handleRelevancePremium(query: string, context: QueryContext): ChatMessage {
  const premium = getRelevancePremium();
  
  const metrics: MetricData[] = [
    { label: "Matched Creative AOV", value: `$${premium.matchedCreativeAOV.toLocaleString()}` },
    { label: "Mismatched Creative AOV", value: `$${premium.mismatchedCreativeAOV.toLocaleString()}` },
    { label: "AOV Lift", value: `+$${premium.aovLift}`, change: premium.aovLiftPercentage },
    { label: "Lift Percentage", value: `+${premium.aovLiftPercentage}%` },
  ];
  
  const chartData: ChartDataPoint[] = [
    { label: "Matched Creative", value: premium.matchedCreativeAOV },
    { label: "Mismatched Creative", value: premium.mismatchedCreativeAOV },
  ];
  
  return createMessage(
    `**The Relevance Premium — Quantifying the Lift**\n\nTransactional analysis confirms that **creative consistency is a primary driver of AOV and conversion**.\n\n**The Finding:**\n• **Matched Creative AOV:** $${premium.matchedCreativeAOV.toLocaleString()}\n• **Mismatched Creative AOV:** $${premium.mismatchedCreativeAOV.toLocaleString()}\n• **Lift:** +$${premium.aovLift} **(+${premium.aovLiftPercentage}%)**\n\n**The Mechanism:**\nWhen the physical mail piece reinforces the digital intent, it anchors the customer's price expectations and emotional commitment. A mismatch — typically a generic Caribbean card sent to a Europe intender — disrupts the narrative, causing customers to reset expectations to a lower price point.\n\nRelevance isn't just good marketing — it's **$${premium.aovLift} per booking** in your pocket.\n\n*This insight is continuously refined as new transaction data flows into the model.*`,
    {
      type: "bar",
      title: "AOV by Creative Match Status",
      data: chartData,
      yKey: "revenue",
    },
    [
      { id: "view-guardrail", label: "View Guardrail Effect", icon: "settings", action: "refine_audience" },
      { id: "export-premium", label: "Export Analysis", icon: "download", action: "export_csv" },
    ]
  );
}

function handleGuardrailEffect(query: string, context: QueryContext): ChatMessage {
  const guardrails = getGuardrailEffects();
  
  const tableData: TableData = {
    columns: [
      { key: "destination", label: "Destination Intent" },
      { key: "matchedRetention", label: "Retention w/ Matched Card" },
      { key: "genericRetention", label: "Retention w/ Generic Card" },
      { key: "drop", label: "Impact" },
      { key: "lossPerSwitch", label: "Loss Per Switch" },
    ],
    rows: guardrails.map(g => ({
      destination: g.destination,
      matchedRetention: `${g.retentionWithMatchedCard}%`,
      genericRetention: `${g.retentionWithGenericCard}%`,
      drop: `-${g.retentionDrop} pts`,
      lossPerSwitch: `$${g.lossPerSwitch.toLocaleString()}`,
    })),
  };
  
  const hawaii = guardrails.find(g => g.destination === "Hawaii")!;
  const europe = guardrails.find(g => g.destination === "Europe")!;
  
  return createMessage(
    `**The Guardrail Effect — Value Protection**\n\nThe direct mail piece acts as a **strategic firewall** that prevents high-intent customers from downgrading their vacation ambitions.\n\n**Hawaii Intenders:**\n• With matched card: **${hawaii.retentionWithMatchedCard}%** book Hawaii\n• With generic card: Only **${hawaii.retentionWithGenericCard}%** stay the course\n• **Loss per switch:** $${hawaii.lossPerSwitch.toLocaleString()} (from $${hawaii.retainedAOV.toLocaleString()} → $${hawaii.switchedAOV.toLocaleString()})\n\n**Europe Intenders:**\n• With matched card: **${europe.retentionWithMatchedCard}%** retention\n• With generic card: Collapses to **${europe.retentionWithGenericCard}%**\n• The vast majority abandon their premium intent and "downgrade"\n\n**The Math:** Every time the guardrail fails, NCL loses ~$2,400 per booking. The generic default isn't a "safety net" — it's a leakage point.`,
    {
      type: "table",
      title: "The Guardrail Effect by Destination",
      data: tableData,
    },
    [
      { id: "view-leakage", label: "Calculate Total Leakage", icon: "settings", action: "refine_audience" },
      { id: "export-guardrail", label: "Export Analysis", icon: "download", action: "export_csv" },
    ]
  );
}

function handleVisitorProfiles(query: string, context: QueryContext): ChatMessage {
  const profiles = getVisitorProfiles();
  
  const tableData: TableData = {
    columns: [
      { key: "visitorId", label: "Visitor ID" },
      { key: "destination", label: "Destination Intent" },
      { key: "score", label: "Propensity Score" },
      { key: "segment", label: "Quality Segment" },
      { key: "behavior", label: "Engagement" },
      { key: "creative", label: "Creative Assignment" },
    ],
    rows: profiles.map(p => ({
      visitorId: p.visitorId,
      destination: p.destinationIntent,
      score: p.propensityScore.toFixed(2),
      segment: p.qualitySegment === 1 ? "1 (Elite)" : `${p.qualitySegment} (${p.qualitySegment === 5 ? "Junk" : "Low"})`,
      behavior: p.engagementBehavior,
      creative: p.currentCreativeAssignment === "Matched" ? "✅ Matched" : "❌ Generic",
    })),
  };
  
  const eliteCount = profiles.filter(p => p.qualitySegment === 1).length;
  const mismatchedElite = profiles.filter(p => p.qualitySegment === 1 && p.currentCreativeAssignment === "Generic/Caribbean").length;
  
  return createMessage(
    `**High-Intent Visitor Profiles**\n\nThese are sample visitors from your database showing the creative mismatch problem:\n\n**Elite Definition:** Propensity Score > 2.25 (top 1% of conversion probability)\n\n**The Pattern:** Visitors with scores above **6.0** have typically engaged in **cart abandonment** behavior — they selected a ship, picked a cabin, and viewed pricing. They are physically ready to buy.\n\n**The Problem:** ${mismatchedElite} of ${eliteCount} Elite visitors in this sample are receiving **Generic/Caribbean creative** instead of destination-matched assets. These are your hottest leads being ignored at the moment of truth.\n\n*Profiles update automatically as new visitor session data flows in.*`,
    {
      type: "table",
      title: "Sample Visitor Profiles",
      data: tableData,
    },
    [
      { id: "view-elite", label: "View All Elite Visitors", icon: "users", action: "create_audience" },
      { id: "export-profiles", label: "Export Profiles", icon: "download", action: "export_csv" },
    ]
  );
}

function handleRevenueLoss(query: string, context: QueryContext): ChatMessage {
  const exotic = getExoticOpportunity();
  const premium = getRelevancePremium();
  const guardrails = getGuardrailEffects();
  
  const europeLeakage = guardrails.find(g => g.destination === "Europe")!;
  const hawaiiLeakage = guardrails.find(g => g.destination === "Hawaii")!;
  
  // Estimate total leakage
  const exoticLeakage = exotic.totalDemandValue; // ~$505M
  const europeEstimate = 309034 * 0.37 * premium.aovLift; // Elite HH * retention drop * AOV loss
  
  const metrics: MetricData[] = [
    { label: "Exotic (Asia/Australia) Leakage", value: `$${(exoticLeakage / 1000000).toFixed(0)}M+` },
    { label: "AOV Loss Per Mismatch", value: `$${premium.aovLift}` },
    { label: "Hawaii Loss Per Switch", value: `$${hawaiiLeakage.lossPerSwitch.toLocaleString()}` },
    { label: "Europe Retention Drop", value: `-${europeLeakage.retentionDrop} pts` },
  ];
  
  return createMessage(
    `**Revenue Leakage Analysis — The Cost of Mismatch**\n\n🚨 **Total Identified Leakage: $400M+**\n\n**The Exotic Black Hole:**\n• ${exotic.totalEliteHouseholds.toLocaleString()} Elite households for Asia/Australia\n• 100% receiving generic creative = **$${(exoticLeakage / 1000000).toFixed(0)}M+ gross demand ignored**\n\n**The Relevance Tax:**\n• Every mismatched creative costs **$${premium.aovLift}** in AOV\n• Hawaii switchers lose **$${hawaiiLeakage.lossPerSwitch.toLocaleString()}** per booking\n• Europe retention collapses from ${europeLeakage.retentionWithMatchedCard}% → ${europeLeakage.retentionWithGenericCard}%\n\n**The Path to Recovery:**\nThis isn't a demand problem — it's a **routing and execution problem**. The customers are present, their intent is high (Score 6.18), and their wallets are open. The barrier is the routing logic that sends a Japan-intender a Caribbean postcard.\n\n*The model continuously tracks these leakage patterns as new data flows in.*`,
    {
      type: "metrics",
      data: metrics,
    },
    [
      { id: "view-fix", label: "View Recovery Plan", icon: "rocket", action: "launch_campaign" },
      { id: "export-leakage", label: "Export Analysis", icon: "download", action: "export_csv" },
    ]
  );
}

function handlePurchaseIntentByDestination(query: string, context: QueryContext): ChatMessage {
  const destinations = getDestinationQuality();
  const households = getEliteHouseholds();
  
  // Sort by propensity score
  const sorted = [...households].sort((a, b) => b.avgPropensityScore - a.avgPropensityScore);
  
  const chartData: ChartDataPoint[] = sorted.map(h => ({
    label: h.destination,
    value: h.avgPropensityScore,
  }));
  
  return createMessage(
    `**Purchase Intent by Destination**\n\nThe E-Commerce Propensity Model reveals which destinations attract the **highest-intent visitors**:\n\n**Top Intent Destinations:**\n1. **Asia (Japan)**: Score **6.18** — Cart abandoners ready to book\n2. **Australia**: Score **6.18** — Same high-intent behavior\n3. **Caribbean (Generic)**: Score **4.35** — High volume, moderate intent\n4. **Hawaii**: Score **4.20** — Strong intent with some matched creative\n5. **Alaska**: Score **3.80** — Good intent, strong baseline loyalty\n\n**The 6.18 Insight:** This extreme score correlates with "Cart Abandonment" behaviors. These visitors aren't dreamers — they're customers who walked up to the counter with a credit card.\n\n**The Tragedy:** The highest-intent destinations (Asia/Australia) have **0% creative match**, while the lowest-intent traffic (Caribbean generic) gets 100% match.`,
    {
      type: "bar",
      title: "Average Propensity Score by Destination",
      data: chartData,
    },
    [
      { id: "view-exotic", label: "View Exotic Opportunity", icon: "users", action: "create_audience" },
      { id: "export-intent", label: "Export Analysis", icon: "download", action: "export_csv" },
    ]
  );
}

function handleDarkSocial(query: string, context: QueryContext): ChatMessage {
  const darkSocial = getDarkSocialMetrics();
  
  const metrics: MetricData[] = [
    { label: "Unclassified Visitors", value: `${(darkSocial.unclassifiedVisitors / 1000000).toFixed(1)}M` },
    { label: "Junk Rate (Unclassified)", value: `${darkSocial.junkRateInUnclassified}%` },
    { label: "Generic Tagging Rate", value: `${darkSocial.genericTaggingRate}%` },
    { label: "Tagged Campaign Score", value: darkSocial.taggedCampaignScoreAvg.toFixed(2) },
    { label: "Untagged Campaign Score", value: darkSocial.untaggedCampaignScoreAvg.toFixed(2) },
  ];
  
  return createMessage(
    `**The "Dark Social" Crisis — Data Governance Failure**\n\n🚨 **${(darkSocial.unclassifiedVisitors / 1000000).toFixed(1)} Million visitors** are trapped in an "Unclassified" bucket due to tagging failures.\n\n**The Problem:**\n• Agencies are using non-standard tags, bypassing the PM_ (Paid Social) naming convention\n• **${darkSocial.junkRateInUnclassified}% junk rate** in unclassified traffic — millions of dollars likely wasted on low-quality social impressions\n• Because this traffic is unclassified, it **cannot be optimized**\n\n**The Governance Gap:**\n• **${darkSocial.genericTaggingRate}%** of agency traffic is tagged as "Generic" (no Product/Region metadata)\n• When agencies DO use proper tags, scores jump from **${darkSocial.untaggedCampaignScoreAvg}** to **${darkSocial.taggedCampaignScoreAvg}** — accurate tagging nearly doubles visibility of high-intent behaviors\n\n**The Fix:** Enforce the tagging mandate. We cannot target what we do not tag.\n\n*The model automatically flags tagging anomalies as data flows in.*`,
    {
      type: "metrics",
      data: metrics,
    },
    [
      { id: "view-tagging", label: "View Tagging Audit", icon: "settings", action: "refine_audience" },
      { id: "export-dark", label: "Export Analysis", icon: "download", action: "export_csv" },
    ]
  );
}

function handleMarketingReadiness(query: string, context: QueryContext): ChatMessage {
  const exotic = getExoticOpportunity();
  const households = getEliteHouseholds();
  const europe = households.find(h => h.destination === "Europe")!;
  
  const tableData: TableData = {
    columns: [
      { key: "destination", label: "Destination" },
      { key: "eliteHouseholds", label: "Ready for Outreach" },
      { key: "score", label: "Avg Intent Score" },
      { key: "conversion", label: "Est. Conversion Rate" },
      { key: "status", label: "Creative Status" },
    ],
    rows: [
      { destination: "Europe", eliteHouseholds: "309,034", score: "0.25*", conversion: "5-7%", status: "🟡 Partial (15%)" },
      { destination: "Asia (Japan)", eliteHouseholds: "74,735", score: "6.18", conversion: "8-12%", status: "🔴 None (0%)" },
      { destination: "Alaska", eliteHouseholds: "62,000", score: "3.80", conversion: "6-8%", status: "🟢 Good (72%)" },
      { destination: "Hawaii", eliteHouseholds: "45,000", score: "4.20", conversion: "7-9%", status: "🟢 Good (65%)" },
      { destination: "Australia", eliteHouseholds: "26,418", score: "6.18", conversion: "8-12%", status: "🔴 None (0%)" },
    ],
  };
  
  const totalReady = 309034 + 74735 + 62000 + 45000 + 26418;
  
  return createMessage(
    `**Marketing Readiness Analysis**\n\nYou have **${totalReady.toLocaleString()} Elite households** ready for targeted outreach — visitors whose digital behavior indicates high purchase intent.\n\n**Immediate Opportunities:**\n\n**🔴 Asia + Australia (101,153 households)**\n• Propensity Score: **6.18** (cart abandoners)\n• Est. Conversion: **8-12%** with matched creative\n• Status: **0% matched creative** — 100% leakage\n• Action: Build Asia/Australia creative assets immediately\n\n**🟡 Europe (309,034 households)**\n• Lower funnel: ~20,000 "ready now"\n• Status: Only **15% matched** creative\n• Action: Europe Pilot — force Europe creative for test cohort\n\n*Note: Europe shows lower avg score (0.25) due to higher upper-funnel volume; the Asia/Australia traffic is concentrated at bottom of funnel.*\n\n*Elite household counts update automatically as new visitor data flows in.*`,
    {
      type: "table",
      title: "Customers Ready for Marketing Outreach",
      data: tableData,
    },
    [
      { id: "build-exotic-audience", label: "Build Exotic Audience", icon: "users", action: "create_audience" },
      { id: "launch-europe-pilot", label: "Launch Europe Pilot", icon: "rocket", action: "launch_campaign" },
      { id: "export-ready", label: "Export Analysis", icon: "download", action: "export_csv" },
    ]
  );
}

// ============ HELPER FUNCTIONS ============

function createMessage(
  content: string,
  visualization?: VisualizationConfig,
  actions?: ActionButton[]
): ChatMessage {
  return {
    id: `msg-${Date.now()}`,
    role: "assistant",
    content,
    timestamp: new Date(),
    visualization,
    actions,
  };
}

function extractDimension(query: string): string | undefined {
  const q = query.toLowerCase();
  if (q.includes("itinerar")) return "itinerary";
  if (q.includes("cabin")) return "cabin_type";
  if (q.includes("campaign")) return "campaign_type";
  if (q.includes("channel")) return "channel";
  if (q.includes("tier")) return "loyalty_tier";
  return undefined;
}

function extractMetric(query: string): string | undefined {
  const q = query.toLowerCase();
  if (q.includes("roas") || q.includes("return")) return "roas";
  if (q.includes("revenue")) return "revenue";
  if (q.includes("booking")) return "bookings";
  if (q.includes("ltv") || q.includes("lifetime")) return "ltv";
  return undefined;
}
