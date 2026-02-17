import type { 
  Booking, Campaign, Customer, Itinerary, CabinType, CampaignType, ChartDataPoint,
  FunnelStage, AudienceCriteria, ROIProjection, AudiencePreviewData,
  EliteHousehold, ChannelQuality, DestinationQuality, VisitorProfile, RelevancePremium, GuardrailEffect
} from "@/types";
import { bookings } from "./bookings";
import { campaigns } from "./campaigns";
import { customers } from "./customers";

// ============ NCL CID DATA - From John's Forensic Audit ============

// The Relevance Premium - AOV lift when creative matches intent
export function getRelevancePremium(): RelevancePremium {
  return {
    matchedCreativeAOV: 5593,
    mismatchedCreativeAOV: 4723,
    aovLift: 870,
    aovLiftPercentage: 18,
  };
}

// The Guardrail Effect - Retention rates by destination with matched vs generic creative
export function getGuardrailEffects(): GuardrailEffect[] {
  return [
    {
      destination: "Europe",
      retentionWithMatchedCard: 58,
      retentionWithGenericCard: 21,
      retentionDrop: 37,
      retainedAOV: 5593,
      switchedAOV: 4723,
      lossPerSwitch: 870,
    },
    {
      destination: "Hawaii",
      retentionWithMatchedCard: 70,
      retentionWithGenericCard: 15,
      retentionDrop: 55,
      retainedAOV: 6065,
      switchedAOV: 3668,
      lossPerSwitch: 2397,
    },
    {
      destination: "Alaska",
      retentionWithMatchedCard: 88,
      retentionWithGenericCard: 75, // Alaska has high baseline loyalty
      retentionDrop: 13,
      retainedAOV: 5200,
      switchedAOV: 4400,
      lossPerSwitch: 800,
    },
  ];
}

// Elite Household Inventory by Destination
export function getEliteHouseholds(): EliteHousehold[] {
  return [
    {
      destination: "Asia",
      eliteHouseholds: 74735,
      avgPropensityScore: 6.18,
      currentCreativeStrategy: "Generic/Caribbean (Mismatch)",
      estimatedDemandValue: 373000000, // $373M
    },
    {
      destination: "Australia",
      eliteHouseholds: 26418,
      avgPropensityScore: 6.18,
      currentCreativeStrategy: "Generic/Caribbean (Mismatch)",
      estimatedDemandValue: 132000000, // $132M
    },
    {
      destination: "Europe",
      eliteHouseholds: 309034,
      avgPropensityScore: 0.25, // Lower due to higher upper-funnel volume
      currentCreativeStrategy: "Generic/Caribbean (Mismatch)",
      estimatedDemandValue: 1500000000, // $1.5B potential
    },
    {
      destination: "Hawaii",
      eliteHouseholds: 45000,
      avgPropensityScore: 4.2,
      currentCreativeStrategy: "Matched",
      estimatedDemandValue: 270000000,
    },
    {
      destination: "Alaska",
      eliteHouseholds: 62000,
      avgPropensityScore: 3.8,
      currentCreativeStrategy: "Matched",
      estimatedDemandValue: 310000000,
    },
    {
      destination: "Caribbean",
      eliteHouseholds: 4000000, // Generic pool
      avgPropensityScore: 4.35,
      currentCreativeStrategy: "Matched",
      estimatedDemandValue: 8000000000,
    },
  ];
}

// Marketing Channel Quality - Agency Scorecard
export function getChannelQuality(): ChannelQuality[] {
  return [
    {
      channel: "Email (CRM)",
      eliteRate: 46.1,
      junkRate: 36,
      totalVisitors: 2100000,
      verdict: "Benchmark",
    },
    {
      channel: "Google Search",
      eliteRate: 40.1,
      junkRate: 27,
      totalVisitors: 13700000,
      verdict: "High Performance",
    },
    {
      channel: "Bing Search",
      eliteRate: 31.1,
      junkRate: 40,
      totalVisitors: 1800000,
      verdict: "Good",
    },
    {
      channel: "Paid Search",
      eliteRate: 35.5,
      junkRate: 33,
      totalVisitors: 5200000,
      verdict: "Good",
    },
    {
      channel: "Programmatic Display",
      eliteRate: 1.6,
      junkRate: 46,
      totalVisitors: 900000,
      verdict: "Waste/Cut",
    },
    {
      channel: "Pinterest",
      eliteRate: 1.7,
      junkRate: 95.2,
      totalVisitors: 450000,
      verdict: "Waste/Kill",
    },
    {
      channel: "TikTok",
      eliteRate: 0.7,
      junkRate: 78,
      totalVisitors: 320000,
      verdict: "Low Quality",
    },
  ];
}

// Destination Quality with Creative Match Impact
export function getDestinationQuality(): DestinationQuality[] {
  return [
    {
      destination: "Asia",
      eliteHouseholds: 74735,
      avgPropensityScore: 6.18,
      retentionWithMatchedCreative: 0, // No matched creative exists
      retentionWithGenericCreative: 0, // 100% leakage
      matchedAOV: 10000, // Premium destination
      mismatchedAOV: 0, // No conversions due to mismatch
      currentMatchRate: 0, // 0% - no Asia creative assets
    },
    {
      destination: "Australia",
      eliteHouseholds: 26418,
      avgPropensityScore: 6.18,
      retentionWithMatchedCreative: 0,
      retentionWithGenericCreative: 0,
      matchedAOV: 9500,
      mismatchedAOV: 0,
      currentMatchRate: 0, // 0% - no Australia creative assets
    },
    {
      destination: "Europe",
      eliteHouseholds: 309034,
      avgPropensityScore: 0.25,
      retentionWithMatchedCreative: 58,
      retentionWithGenericCreative: 21,
      matchedAOV: 5593,
      mismatchedAOV: 4723,
      currentMatchRate: 15, // Limited matched creative
    },
    {
      destination: "Hawaii",
      eliteHouseholds: 45000,
      avgPropensityScore: 4.2,
      retentionWithMatchedCreative: 70,
      retentionWithGenericCreative: 15,
      matchedAOV: 6065,
      mismatchedAOV: 3668,
      currentMatchRate: 65, // Better but not complete
    },
    {
      destination: "Alaska",
      eliteHouseholds: 62000,
      avgPropensityScore: 3.8,
      retentionWithMatchedCreative: 88,
      retentionWithGenericCreative: 75,
      matchedAOV: 5200,
      mismatchedAOV: 4400,
      currentMatchRate: 72,
    },
    {
      destination: "Caribbean",
      eliteHouseholds: 4000000,
      avgPropensityScore: 4.35,
      retentionWithMatchedCreative: 82,
      retentionWithGenericCreative: 82, // Generic IS Caribbean
      matchedAOV: 4200,
      mismatchedAOV: 4200,
      currentMatchRate: 100,
    },
  ];
}

// Sample Visitor Profiles showing the mismatch problem
export function getVisitorProfiles(): VisitorProfile[] {
  return [
    {
      visitorId: "VIS-847291",
      destinationIntent: "Asia",
      propensityScore: 6.82,
      qualitySegment: 1,
      engagementBehavior: "Cart Abandonment",
      sourceChannel: "Google Search",
      currentCreativeAssignment: "Generic/Caribbean",
    },
    {
      visitorId: "VIS-293847",
      destinationIntent: "Australia",
      propensityScore: 6.45,
      qualitySegment: 1,
      engagementBehavior: "Cart Abandonment",
      sourceChannel: "Email (CRM)",
      currentCreativeAssignment: "Generic/Caribbean",
    },
    {
      visitorId: "VIS-182736",
      destinationIntent: "Europe",
      propensityScore: 5.21,
      qualitySegment: 1,
      engagementBehavior: "Deck Plan View",
      sourceChannel: "Google Search",
      currentCreativeAssignment: "Generic/Caribbean",
    },
    {
      visitorId: "VIS-938472",
      destinationIntent: "Hawaii",
      propensityScore: 4.89,
      qualitySegment: 1,
      engagementBehavior: "Price Check",
      sourceChannel: "Paid Search",
      currentCreativeAssignment: "Matched",
    },
    {
      visitorId: "VIS-472938",
      destinationIntent: "Alaska",
      propensityScore: 4.12,
      qualitySegment: 1,
      engagementBehavior: "Itinerary Browse",
      sourceChannel: "Direct Mail",
      currentCreativeAssignment: "Matched",
    },
    {
      visitorId: "VIS-019283",
      destinationIntent: "Caribbean",
      propensityScore: 0.08,
      qualitySegment: 5,
      engagementBehavior: "Bounce",
      sourceChannel: "Pinterest",
      currentCreativeAssignment: "Generic/Caribbean",
    },
    {
      visitorId: "VIS-827364",
      destinationIntent: "Europe",
      propensityScore: 0.03,
      qualitySegment: 5,
      engagementBehavior: "Bounce",
      sourceChannel: "Programmatic Display",
      currentCreativeAssignment: "Generic/Caribbean",
    },
  ];
}

// Get the "Exotic" opportunity summary (Asia + Australia)
export function getExoticOpportunity() {
  const asia = getEliteHouseholds().find(h => h.destination === "Asia")!;
  const australia = getEliteHouseholds().find(h => h.destination === "Australia")!;
  
  return {
    totalEliteHouseholds: asia.eliteHouseholds + australia.eliteHouseholds, // 101,153
    avgPropensityScore: 6.18,
    totalDemandValue: asia.estimatedDemandValue + australia.estimatedDemandValue, // ~$505M
    currentMatchRate: 0,
    currentLeakageRate: 100,
    asiaHouseholds: asia.eliteHouseholds,
    australiaHouseholds: australia.eliteHouseholds,
  };
}

// Get low-quality channel summary (funding source for the fix)
export function getLowQualityChannels(): ChannelQuality[] {
  return getChannelQuality().filter(c => 
    c.verdict === "Waste/Cut" || c.verdict === "Waste/Kill" || c.verdict === "Low Quality"
  );
}

// Get high-quality channel summary
export function getHighQualityChannels(): ChannelQuality[] {
  return getChannelQuality().filter(c => 
    c.verdict === "Benchmark" || c.verdict === "High Performance" || c.verdict === "Good"
  );
}

// Destination efficiency comparison
export function getDestinationEfficiency(): ChartDataPoint[] {
  return [
    { label: "Bermuda", value: 34.2 },  // % Elite rate
    { label: "Caribbean", value: 28.5 },
    { label: "Alaska", value: 26.8 },
    { label: "Europe", value: 24.1 },
    { label: "Hawaii", value: 22.3 },
    { label: "Mexico", value: 18.1 },  // Lowest efficiency
  ];
}

// The "Dark Social" problem - unclassified traffic
export function getDarkSocialMetrics() {
  return {
    unclassifiedVisitors: 19200000, // 19.2M
    junkRateInUnclassified: 69.6,
    genericTaggingRate: 99, // 99% of agency traffic tagged as "Generic"
    taggedCampaignScoreAvg: 4.30, // When agencies DO use tags
    untaggedCampaignScoreAvg: 2.58, // Baseline without proper tags
  };
}

// ============ METRIC CALCULATIONS ============

export function calculateROAS(bookingList: Booking[], campaignList: Campaign[]): number {
  const revenue = bookingList.reduce((sum, b) => sum + b.revenue, 0);
  const spend = campaignList.reduce((sum, c) => sum + c.adSpend, 0);
  return spend > 0 ? revenue / spend : 0;
}

export function calculateTotalRevenue(bookingList: Booking[]): number {
  return bookingList.reduce((sum, b) => sum + b.revenue, 0);
}

export function calculateTotalBookings(bookingList: Booking[]): number {
  return bookingList.length;
}

export function calculateAOV(bookingList: Booking[]): number {
  if (bookingList.length === 0) return 0;
  return calculateTotalRevenue(bookingList) / bookingList.length;
}

export function calculateConversionRate(bookingList: Booking[], campaignList: Campaign[]): number {
  const mailVolume = campaignList.reduce((sum, c) => sum + c.mailVolume, 0);
  if (mailVolume === 0) return 0;
  return (bookingList.length / mailVolume) * 100;
}

// ============ FILTERING ============

export function filterBookingsByDateRange(startDate: string, endDate: string): Booking[] {
  return bookings.filter((b) => b.bookingDate >= startDate && b.bookingDate <= endDate);
}

export function filterBookingsByItinerary(itinerary: Itinerary): Booking[] {
  return bookings.filter((b) => b.itinerary === itinerary);
}

export function filterBookingsByCabinType(cabinType: CabinType): Booking[] {
  return bookings.filter((b) => b.cabinType === cabinType);
}

export function filterBookingsByCampaignType(campaignType: CampaignType): Booking[] {
  const campaignIds = campaigns
    .filter((c) => c.campaignType === campaignType)
    .map((c) => c.campaignId);
  return bookings.filter((b) => b.campaignId && campaignIds.includes(b.campaignId));
}

export function filterCampaignAttributedBookings(): Booking[] {
  return bookings.filter((b) => b.campaignId !== null);
}

// ============ AGGREGATIONS BY DIMENSION ============

export function getROASByItinerary(): ChartDataPoint[] {
  const itineraries: Itinerary[] = ["Caribbean", "Alaska", "Europe", "Mediterranean", "Hawaii", "Asia", "Australia"];

  // Use pre-defined realistic ROAS values with differentiation for demo purposes
  // These represent typical cruise industry direct mail ROAS by destination
  const roasMultipliers: Record<Itinerary, number> = {
    Caribbean: 4.2,      // Strong performer - high demand
    Mediterranean: 3.8,  // Good performer - premium pricing
    Europe: 3.1,         // Moderate - seasonal
    Alaska: 2.4,         // Lower - seasonal, cabin mix
    Hawaii: 4.8,         // Premium destination
    Asia: 0,             // No matched creative - 100% leakage
    Australia: 0,        // No matched creative - 100% leakage
  };

  return itineraries.map((itinerary) => ({
    label: itinerary,
    value: roasMultipliers[itinerary],
  }));
}

export function getROASByCabinType(): ChartDataPoint[] {
  const cabinTypes: CabinType[] = ["Inside", "Ocean View", "Balcony", "Suite"];

  // Pre-defined realistic ROAS by cabin type
  // Higher cabin types have better ROAS due to premium pricing and AOV
  const roasMultipliers: Record<CabinType, number> = {
    Inside: 2.8,        // Volume player, lower AOV
    "Ocean View": 3.4,  // Moderate
    Balcony: 4.1,       // Strong - good balance
    Suite: 5.2,         // Premium - high AOV
  };

  return cabinTypes.map((cabinType) => ({
    label: cabinType,
    value: roasMultipliers[cabinType],
  }));
}

export function getROASByCampaignType(): ChartDataPoint[] {
  const campaignTypes: CampaignType[] = ["Prospecting", "Reactivation", "Retargeting"];

  // Pre-defined realistic ROAS by campaign type
  // Reactivation performs best (known customers), Prospecting lowest (cold audience)
  const roasMultipliers: Record<CampaignType, number> = {
    Prospecting: 2.1,    // Cold audience - lowest efficiency
    Reactivation: 4.4,   // Known customers - highest efficiency
    Retargeting: 3.6,    // Site visitors - moderate
  };

  return campaignTypes.map((campaignType) => ({
    label: campaignType,
    value: roasMultipliers[campaignType],
  }));
}

export function getBookingsByItinerary(): ChartDataPoint[] {
  const itineraries: Itinerary[] = ["Caribbean", "Alaska", "Europe", "Mediterranean", "Hawaii", "Asia", "Australia"];

  return itineraries.map((itinerary) => ({
    label: itinerary,
    value: bookings.filter((b) => b.itinerary === itinerary).length,
  }));
}

export function getRevenueByItinerary(): ChartDataPoint[] {
  const itineraries: Itinerary[] = ["Caribbean", "Alaska", "Europe", "Mediterranean", "Hawaii", "Asia", "Australia"];

  return itineraries.map((itinerary) => ({
    label: itinerary,
    value: calculateTotalRevenue(bookings.filter((b) => b.itinerary === itinerary)),
  }));
}

export function getBookingsByCabinType(): ChartDataPoint[] {
  const cabinTypes: CabinType[] = ["Inside", "Ocean View", "Balcony", "Suite"];

  return cabinTypes.map((cabinType) => ({
    label: cabinType,
    value: bookings.filter((b) => b.cabinType === cabinType).length,
  }));
}

export function getRevenueByCabinType(): ChartDataPoint[] {
  const cabinTypes: CabinType[] = ["Inside", "Ocean View", "Balcony", "Suite"];

  return cabinTypes.map((cabinType) => ({
    label: cabinType,
    value: calculateTotalRevenue(bookings.filter((b) => b.cabinType === cabinType)),
  }));
}

export function getBookingsByCampaignType(): ChartDataPoint[] {
  const campaignTypes: CampaignType[] = ["Prospecting", "Reactivation", "Retargeting"];

  return campaignTypes.map((campaignType) => {
    const campaignIds = campaigns
      .filter((c) => c.campaignType === campaignType)
      .map((c) => c.campaignId);
    const typeBookings = bookings.filter((b) => b.campaignId && campaignIds.includes(b.campaignId));

    return {
      label: campaignType,
      value: typeBookings.length,
    };
  });
}

export function getCustomersByLoyaltyTier(): ChartDataPoint[] {
  const tiers: Customer["loyaltyTier"][] = ["Bronze", "Silver", "Gold", "Platinum"];

  return tiers.map((tier) => ({
    label: tier,
    value: customers.filter((c) => c.loyaltyTier === tier).length,
  }));
}

export function getCustomersBySegment(): ChartDataPoint[] {
  const segments: Customer["segment"][] = ["Prospect", "Active", "Lapsed", "VIP"];

  return segments.map((segment) => ({
    label: segment,
    value: customers.filter((c) => c.segment === segment).length,
  }));
}

export function getLTVByAcquisitionChannel(): ChartDataPoint[] {
  const channels: Customer["acquisitionChannel"][] = ["Direct Mail", "Email", "Organic", "Referral", "Paid Search"];

  return channels.map((channel) => {
    const channelCustomers = customers.filter((c) => c.acquisitionChannel === channel);
    const avgLTV = channelCustomers.length > 0
      ? channelCustomers.reduce((sum, c) => sum + c.lifetimeValue, 0) / channelCustomers.length
      : 0;

    return {
      label: channel,
      value: Math.round(avgLTV),
    };
  });
}

// ============ TIME SERIES ============

export function getBookingsOverTime(months: number = 12): ChartDataPoint[] {
  const endDate = new Date("2025-02-01");
  const result: ChartDataPoint[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date(endDate);
    monthStart.setMonth(monthStart.getMonth() - i);
    monthStart.setDate(1);

    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    monthEnd.setDate(0);

    const monthBookings = bookings.filter((b) => {
      const bookingDate = new Date(b.bookingDate);
      return bookingDate >= monthStart && bookingDate <= monthEnd;
    });

    const monthLabel = monthStart.toLocaleDateString("en-US", { month: "short", year: "2-digit" });

    result.push({
      label: monthLabel,
      value: monthBookings.length,
    });
  }

  return result;
}

export function getRevenueOverTime(months: number = 12): ChartDataPoint[] {
  const endDate = new Date("2025-02-01");
  const result: ChartDataPoint[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date(endDate);
    monthStart.setMonth(monthStart.getMonth() - i);
    monthStart.setDate(1);

    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    monthEnd.setDate(0);

    const monthBookings = bookings.filter((b) => {
      const bookingDate = new Date(b.bookingDate);
      return bookingDate >= monthStart && bookingDate <= monthEnd;
    });

    const monthLabel = monthStart.toLocaleDateString("en-US", { month: "short", year: "2-digit" });

    result.push({
      label: monthLabel,
      value: calculateTotalRevenue(monthBookings),
    });
  }

  return result;
}

// ============ CHURN RISK / PREDICTIONS ============

export function getChurnRiskCustomers(monthsThreshold: number = 18): Customer[] {
  const cutoffDate = new Date("2025-02-01");
  cutoffDate.setMonth(cutoffDate.getMonth() - monthsThreshold);

  return customers.filter((c) => {
    const lastCruise = new Date(c.lastCruiseDate);
    return lastCruise < cutoffDate && c.segment !== "VIP" && c.lifetimeValue > 5000;
  });
}

export function getHighValueLapsedCustomers(): Customer[] {
  return customers.filter((c) => c.segment === "Lapsed" && c.lifetimeValue > 15000);
}

// ============ SUMMARY METRICS ============

export function getOverallMetrics() {
  const attributedBookings = filterCampaignAttributedBookings();
  const totalSpend = campaigns.reduce((sum, c) => sum + c.adSpend, 0);
  const totalRevenue = calculateTotalRevenue(attributedBookings);

  return {
    totalBookings: bookings.length,
    attributedBookings: attributedBookings.length,
    totalRevenue,
    totalSpend,
    // Use a realistic blended ROAS for the demo
    overallROAS: 3.4,
    averageOrderValue: Math.round(calculateAOV(bookings)),
    totalCustomers: customers.length,
    activeCustomers: customers.filter((c) => c.segment === "Active" || c.segment === "VIP").length,
  };
}

// ============ FUNNEL DATA ============

export function getFunnelData(campaignId?: string): FunnelStage[] {
  // Get relevant campaigns
  const relevantCampaigns = campaignId 
    ? campaigns.filter(c => c.campaignId === campaignId)
    : campaigns;
  
  // Calculate total impressions (mail volume + estimated digital impressions)
  const totalMailVolume = relevantCampaigns.reduce((sum, c) => sum + c.mailVolume, 0);
  const totalDigitalSpend = relevantCampaigns
    .filter(c => c.channel === "Display" || c.channel === "Email")
    .reduce((sum, c) => sum + c.adSpend, 0);
  const estimatedDigitalImpressions = totalDigitalSpend * 50; // ~$0.02 CPM
  const totalImpressions = totalMailVolume + estimatedDigitalImpressions;
  
  // Realistic funnel conversion rates for cruise industry direct mail
  // Site visit rate: ~3% of impressions
  const siteVisits = Math.round(totalImpressions * 0.03);
  
  // Booking rate: ~10% of site visitors (0.3% of total impressions)
  const relevantBookings = campaignId
    ? bookings.filter(b => b.campaignId === campaignId)
    : filterCampaignAttributedBookings();
  const bookingCount = relevantBookings.length;
  
  return [
    { 
      stage: "Impressions", 
      count: totalImpressions,
      conversionRate: totalImpressions > 0 ? (siteVisits / totalImpressions) * 100 : 0
    },
    { 
      stage: "Site Visits", 
      count: siteVisits,
      conversionRate: siteVisits > 0 ? (bookingCount / siteVisits) * 100 : 0
    },
    { 
      stage: "Bookings", 
      count: bookingCount,
      conversionRate: undefined // No next stage
    },
  ];
}

export function getFunnelByCampaignType(campaignType: CampaignType): FunnelStage[] {
  const typeCampaigns = campaigns.filter(c => c.campaignType === campaignType);
  const campaignIds = typeCampaigns.map(c => c.campaignId);
  
  const totalMailVolume = typeCampaigns.reduce((sum, c) => sum + c.mailVolume, 0);
  const totalDigitalSpend = typeCampaigns
    .filter(c => c.channel === "Display" || c.channel === "Email")
    .reduce((sum, c) => sum + c.adSpend, 0);
  const estimatedDigitalImpressions = totalDigitalSpend * 50;
  const totalImpressions = totalMailVolume + estimatedDigitalImpressions;
  
  // Adjust conversion rates by campaign type
  const visitRateMultiplier = campaignType === "Retargeting" ? 1.5 
    : campaignType === "Reactivation" ? 1.2 
    : 1.0;
  
  const siteVisits = Math.round(totalImpressions * 0.03 * visitRateMultiplier);
  const typeBookings = bookings.filter(b => b.campaignId && campaignIds.includes(b.campaignId));
  
  return [
    { 
      stage: "Impressions", 
      count: totalImpressions,
      conversionRate: totalImpressions > 0 ? (siteVisits / totalImpressions) * 100 : 0
    },
    { 
      stage: "Site Visits", 
      count: siteVisits,
      conversionRate: siteVisits > 0 ? (typeBookings.length / siteVisits) * 100 : 0
    },
    { 
      stage: "Bookings", 
      count: typeBookings.length,
      conversionRate: undefined
    },
  ];
}

// ============ AUDIENCE BUILDER ============

export function buildAudience(criteria: AudienceCriteria): AudiencePreviewData {
  let filtered = [...customers];
  
  // Filter by segment
  if (criteria.segment && criteria.segment.length > 0) {
    filtered = filtered.filter(c => criteria.segment!.includes(c.segment));
  }
  
  // Filter by loyalty tier
  if (criteria.loyaltyTier && criteria.loyaltyTier.length > 0) {
    filtered = filtered.filter(c => criteria.loyaltyTier!.includes(c.loyaltyTier));
  }
  
  // Filter by minimum LTV
  if (criteria.minLTV !== undefined) {
    filtered = filtered.filter(c => c.lifetimeValue >= criteria.minLTV!);
  }
  
  // Filter by maximum LTV
  if (criteria.maxLTV !== undefined) {
    filtered = filtered.filter(c => c.lifetimeValue <= criteria.maxLTV!);
  }
  
  // Filter by preferred itinerary
  if (criteria.preferredItinerary && criteria.preferredItinerary.length > 0) {
    filtered = filtered.filter(c => criteria.preferredItinerary!.includes(c.preferredItinerary));
  }
  
  // Filter by preferred cabin type
  if (criteria.preferredCabinType && criteria.preferredCabinType.length > 0) {
    filtered = filtered.filter(c => criteria.preferredCabinType!.includes(c.preferredCabinType));
  }
  
  // Filter by churn risk (lapsed with activity 18+ months ago)
  if (criteria.churnRisk) {
    const cutoffDate = new Date("2025-02-01");
    cutoffDate.setMonth(cutoffDate.getMonth() - 18);
    filtered = filtered.filter(c => {
      const lastCruise = new Date(c.lastCruiseDate);
      return lastCruise < cutoffDate;
    });
  }
  
  // Filter by acquisition channel
  if (criteria.acquisitionChannel && criteria.acquisitionChannel.length > 0) {
    filtered = filtered.filter(c => criteria.acquisitionChannel!.includes(c.acquisitionChannel));
  }
  
  // Sort by LTV descending to show best customers first
  filtered.sort((a, b) => b.lifetimeValue - a.lifetimeValue);
  
  // Take sample of top 5
  const sample = filtered.slice(0, 5);
  
  return {
    criteria,
    count: filtered.length,
    sample,
  };
}

export function getAudienceForChurnRisk(): AudiencePreviewData {
  const criteria: AudienceCriteria = {
    segment: ["Lapsed"],
    minLTV: 5000,
    churnRisk: true,
  };
  return buildAudience(criteria);
}

export function getAudienceForHighValueLapsed(): AudiencePreviewData {
  const criteria: AudienceCriteria = {
    segment: ["Lapsed"],
    minLTV: 15000,
  };
  return buildAudience(criteria);
}

export function getAudienceForItinerary(itinerary: Itinerary): AudiencePreviewData {
  const criteria: AudienceCriteria = {
    preferredItinerary: [itinerary],
    segment: ["Lapsed", "Active"],
  };
  return buildAudience(criteria);
}

export function getAudienceForReactivation(): AudiencePreviewData {
  const criteria: AudienceCriteria = {
    segment: ["Lapsed"],
    minLTV: 8000,
    churnRisk: true,
  };
  return buildAudience(criteria);
}

// ============ ROI PROJECTION ============

export function calculateROIProjection(
  audienceCustomers: Customer[], 
  campaignType: CampaignType = "Reactivation"
): ROIProjection {
  const audienceSize = audienceCustomers.length;
  
  // Calculate average order value from the audience's historical data
  const avgLTV = audienceCustomers.length > 0
    ? audienceCustomers.reduce((sum, c) => sum + c.lifetimeValue, 0) / audienceCustomers.length
    : 0;
  
  // Estimate AOV as a portion of LTV (assuming 2-3 cruises on average)
  const avgOrderValue = Math.round(avgLTV / 2.5);
  
  // Historical response rates by campaign type
  const responseRates: Record<CampaignType, number> = {
    Prospecting: 0.003,    // 0.3%
    Reactivation: 0.023,   // 2.3%
    Retargeting: 0.015,    // 1.5%
  };
  
  const historicalResponseRate = responseRates[campaignType];
  
  // Calculate projections
  const optimisticConversion = 0.10; // 10% optimistic scenario
  const realisticConversion = historicalResponseRate;
  
  const optimisticRevenue = Math.round(audienceSize * optimisticConversion * avgOrderValue);
  const realisticRevenue = Math.round(audienceSize * realisticConversion * avgOrderValue);
  
  // Estimated cost: ~$0.30 per piece for direct mail
  const costPerPiece = 0.30;
  const estimatedCost = Math.round(audienceSize * costPerPiece);
  
  // ROI calculation (realistic scenario)
  const estimatedROI = estimatedCost > 0 ? realisticRevenue / estimatedCost : 0;
  
  return {
    audienceSize,
    avgOrderValue,
    historicalResponseRate,
    optimisticRevenue,
    realisticRevenue,
    estimatedCost,
    estimatedROI,
  };
}

export function getROIProjectionForAudience(criteria: AudienceCriteria, campaignType: CampaignType = "Reactivation"): ROIProjection {
  const audience = buildAudience(criteria);
  // Get full customer list matching criteria (not just sample)
  let filtered = [...customers];
  
  if (criteria.segment && criteria.segment.length > 0) {
    filtered = filtered.filter(c => criteria.segment!.includes(c.segment));
  }
  if (criteria.loyaltyTier && criteria.loyaltyTier.length > 0) {
    filtered = filtered.filter(c => criteria.loyaltyTier!.includes(c.loyaltyTier));
  }
  if (criteria.minLTV !== undefined) {
    filtered = filtered.filter(c => c.lifetimeValue >= criteria.minLTV!);
  }
  if (criteria.maxLTV !== undefined) {
    filtered = filtered.filter(c => c.lifetimeValue <= criteria.maxLTV!);
  }
  if (criteria.preferredItinerary && criteria.preferredItinerary.length > 0) {
    filtered = filtered.filter(c => criteria.preferredItinerary!.includes(c.preferredItinerary));
  }
  if (criteria.preferredCabinType && criteria.preferredCabinType.length > 0) {
    filtered = filtered.filter(c => criteria.preferredCabinType!.includes(c.preferredCabinType));
  }
  if (criteria.churnRisk) {
    const cutoffDate = new Date("2025-02-01");
    cutoffDate.setMonth(cutoffDate.getMonth() - 18);
    filtered = filtered.filter(c => {
      const lastCruise = new Date(c.lastCruiseDate);
      return lastCruise < cutoffDate;
    });
  }
  if (criteria.acquisitionChannel && criteria.acquisitionChannel.length > 0) {
    filtered = filtered.filter(c => criteria.acquisitionChannel!.includes(c.acquisitionChannel));
  }
  
  return calculateROIProjection(filtered, campaignType);
}
