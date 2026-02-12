import type { Customer, CampaignType, MarketingChannel, CampaignRecommendation, Itinerary, CabinType } from "@/types";

// Analyze audience characteristics
function analyzeAudience(customers: Customer[]) {
  if (customers.length === 0) {
    return {
      avgLTV: 0,
      dominantItinerary: "Caribbean" as Itinerary,
      itineraryPct: 0,
      dominantCabin: "Balcony" as CabinType,
      cabinPct: 0,
      dominantTier: "Bronze" as Customer["loyaltyTier"],
      tierPct: 0,
      avgCruises: 0,
      lapsedPct: 0,
      vipPct: 0,
    };
  }
  
  const avgLTV = customers.reduce((sum, c) => sum + c.lifetimeValue, 0) / customers.length;
  const avgCruises = customers.reduce((sum, c) => sum + c.totalCruises, 0) / customers.length;
  
  // Count itinerary preferences
  const itineraryCounts: Record<Itinerary, number> = {
    Caribbean: 0, Alaska: 0, Europe: 0, Mediterranean: 0
  };
  customers.forEach(c => itineraryCounts[c.preferredItinerary]++);
  const dominantItinerary = (Object.entries(itineraryCounts) as [Itinerary, number][])
    .sort((a, b) => b[1] - a[1])[0];
  
  // Count cabin preferences
  const cabinCounts: Record<CabinType, number> = {
    Inside: 0, "Ocean View": 0, Balcony: 0, Suite: 0
  };
  customers.forEach(c => cabinCounts[c.preferredCabinType]++);
  const dominantCabin = (Object.entries(cabinCounts) as [CabinType, number][])
    .sort((a, b) => b[1] - a[1])[0];
  
  // Count loyalty tiers
  const tierCounts: Record<Customer["loyaltyTier"], number> = {
    Bronze: 0, Silver: 0, Gold: 0, Platinum: 0
  };
  customers.forEach(c => tierCounts[c.loyaltyTier]++);
  const dominantTier = (Object.entries(tierCounts) as [Customer["loyaltyTier"], number][])
    .sort((a, b) => b[1] - a[1])[0];
  
  // Segment percentages
  const lapsedCount = customers.filter(c => c.segment === "Lapsed").length;
  const vipCount = customers.filter(c => c.segment === "VIP").length;
  
  return {
    avgLTV,
    dominantItinerary: dominantItinerary[0],
    itineraryPct: Math.round((dominantItinerary[1] / customers.length) * 100),
    dominantCabin: dominantCabin[0],
    cabinPct: Math.round((dominantCabin[1] / customers.length) * 100),
    dominantTier: dominantTier[0],
    tierPct: Math.round((dominantTier[1] / customers.length) * 100),
    avgCruises,
    lapsedPct: Math.round((lapsedCount / customers.length) * 100),
    vipPct: Math.round((vipCount / customers.length) * 100),
  };
}

// Generate messaging suggestions based on audience
function generateMessaging(analysis: ReturnType<typeof analyzeAudience>): string {
  const messages: string[] = [];
  
  // Itinerary-specific messaging
  const itineraryMessages: Record<Itinerary, string> = {
    Caribbean: "tropical getaway imagery with beach and island highlights",
    Alaska: "wildlife and glacier scenery with adventure experiences",
    Europe: "cultural immersion and historic port destinations",
    Mediterranean: "coastal elegance with food and wine experiences",
  };
  messages.push(`Highlight ${itineraryMessages[analysis.dominantItinerary]}`);
  
  // Cabin upgrade opportunity
  if (analysis.dominantCabin === "Inside" || analysis.dominantCabin === "Ocean View") {
    messages.push("Include upgrade offers to Balcony or Suite");
  } else if (analysis.dominantCabin === "Balcony") {
    messages.push("Feature suite upgrade incentives");
  }
  
  // Loyalty-based messaging
  if (analysis.tierPct > 40 && (analysis.dominantTier === "Gold" || analysis.dominantTier === "Platinum")) {
    messages.push("Emphasize exclusive loyalty benefits and recognition");
  }
  
  // Win-back messaging for lapsed
  if (analysis.lapsedPct > 50) {
    messages.push("\"We miss you\" reactivation theme with limited-time offer");
  }
  
  // VIP treatment
  if (analysis.vipPct > 20) {
    messages.push("Personalized concierge-level invitation");
  }
  
  return messages.join(". ") + ".";
}

// Generate rationale based on analysis
function generateRationale(
  analysis: ReturnType<typeof analyzeAudience>,
  campaignType: CampaignType
): string {
  const reasons: string[] = [];
  
  if (campaignType === "Reactivation") {
    reasons.push(`${analysis.lapsedPct}% of this segment has lapsed`);
    if (analysis.avgLTV > 10000) {
      reasons.push(`high average LTV of $${Math.round(analysis.avgLTV).toLocaleString()}`);
    }
    reasons.push(`${analysis.avgCruises.toFixed(1)} avg cruises indicates proven engagement`);
  } else if (campaignType === "Retargeting") {
    reasons.push("Recent site engagement indicates active consideration");
    reasons.push(`${analysis.itineraryPct}% preference for ${analysis.dominantItinerary}`);
  } else {
    reasons.push("Prospect profile matches high-value customer characteristics");
    if (analysis.avgLTV > 8000) {
      reasons.push("Similar audiences have strong LTV potential");
    }
  }
  
  return reasons.join("; ").charAt(0).toUpperCase() + reasons.join("; ").slice(1);
}

// Determine best campaign type
function determineCampaignType(analysis: ReturnType<typeof analyzeAudience>): CampaignType {
  // High lapsed percentage → Reactivation
  if (analysis.lapsedPct > 50) {
    return "Reactivation";
  }
  
  // VIP heavy → Reactivation (retention focus)
  if (analysis.vipPct > 30) {
    return "Reactivation";
  }
  
  // Low cruise count, low LTV → Prospecting
  if (analysis.avgCruises < 2 && analysis.avgLTV < 5000) {
    return "Prospecting";
  }
  
  // Default to Retargeting for engaged audiences
  return "Retargeting";
}

// Determine best channel
function determineChannel(analysis: ReturnType<typeof analyzeAudience>, campaignType: CampaignType): MarketingChannel {
  // High LTV customers → Direct Mail (higher impact)
  if (analysis.avgLTV > 12000) {
    return "Direct Mail";
  }
  
  // Reactivation → Direct Mail (more personal)
  if (campaignType === "Reactivation") {
    return "Direct Mail";
  }
  
  // Retargeting → Can use Email for faster response
  if (campaignType === "Retargeting" && analysis.avgLTV < 8000) {
    return "Email";
  }
  
  // Default to Direct Mail
  return "Direct Mail";
}

// Calculate expected response rate
function calculateExpectedResponseRate(
  analysis: ReturnType<typeof analyzeAudience>,
  campaignType: CampaignType,
  channel: MarketingChannel
): number {
  // Base rates by campaign type
  const baseRates: Record<CampaignType, number> = {
    Prospecting: 0.003,
    Reactivation: 0.023,
    Retargeting: 0.015,
  };
  
  let rate = baseRates[campaignType];
  
  // Adjust for channel
  if (channel === "Email") {
    rate *= 0.8; // Email slightly lower than direct mail
  }
  
  // Adjust for audience quality
  if (analysis.avgLTV > 15000) {
    rate *= 1.2; // High-value audiences respond better
  }
  if (analysis.vipPct > 20) {
    rate *= 1.15; // VIPs more engaged
  }
  if (analysis.avgCruises > 4) {
    rate *= 1.1; // Frequent cruisers more responsive
  }
  
  // Cap at reasonable maximum
  return Math.min(rate, 0.05);
}

// Determine confidence level
function determineConfidence(
  analysis: ReturnType<typeof analyzeAudience>,
  audienceSize: number
): CampaignRecommendation["confidence"] {
  // Small audiences → lower confidence
  if (audienceSize < 50) {
    return "low";
  }
  
  // Very homogeneous audience → high confidence
  if (analysis.itineraryPct > 60 && analysis.tierPct > 50) {
    return "high";
  }
  
  // High LTV, good size → high confidence
  if (analysis.avgLTV > 12000 && audienceSize > 100) {
    return "high";
  }
  
  return "medium";
}

// Main recommendation generator
export function generateCampaignRecommendation(customers: Customer[]): CampaignRecommendation {
  const analysis = analyzeAudience(customers);
  
  const campaignType = determineCampaignType(analysis);
  const channel = determineChannel(analysis, campaignType);
  const messaging = generateMessaging(analysis);
  const rationale = generateRationale(analysis, campaignType);
  const expectedResponseRate = calculateExpectedResponseRate(analysis, campaignType, channel);
  const confidence = determineConfidence(analysis, customers.length);
  
  return {
    campaignType,
    channel,
    messaging,
    rationale,
    expectedResponseRate,
    confidence,
  };
}

// Generate recommendation for a specific scenario
export function generateReactivationRecommendation(customers: Customer[]): CampaignRecommendation {
  const analysis = analyzeAudience(customers);
  
  const channel: MarketingChannel = analysis.avgLTV > 10000 ? "Direct Mail" : "Email";
  const messaging = generateMessaging(analysis);
  const expectedResponseRate = calculateExpectedResponseRate(analysis, "Reactivation", channel);
  
  return {
    campaignType: "Reactivation",
    channel,
    messaging,
    rationale: `Lapsed customers with $${Math.round(analysis.avgLTV).toLocaleString()} avg LTV and ${analysis.avgCruises.toFixed(1)} average cruises represent strong reactivation potential`,
    expectedResponseRate,
    confidence: customers.length > 50 ? "high" : "medium",
  };
}

export function generateProspectingRecommendation(customers: Customer[]): CampaignRecommendation {
  const analysis = analyzeAudience(customers);
  
  return {
    campaignType: "Prospecting",
    channel: "Direct Mail",
    messaging: generateMessaging(analysis),
    rationale: `Profile matches successful customer attributes with ${analysis.itineraryPct}% ${analysis.dominantItinerary} preference`,
    expectedResponseRate: 0.003,
    confidence: "medium",
  };
}
