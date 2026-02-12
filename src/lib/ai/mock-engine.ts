import type { ChatMessage, QueryContext, VisualizationConfig, ActionButton, ChartDataPoint, MetricData, TableData } from "@/types";
import * as queryEngine from "@/lib/data/query-engine";
import { getChurnRiskCustomers, getHighValueLapsedCustomers } from "@/lib/data/query-engine";

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
