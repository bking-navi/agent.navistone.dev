import type { 
  Booking, Campaign, Customer, Itinerary, CabinType, CampaignType, ChartDataPoint,
  FunnelStage, AudienceCriteria, ROIProjection, AudiencePreviewData
} from "@/types";
import { bookings } from "./bookings";
import { campaigns } from "./campaigns";
import { customers } from "./customers";

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
  const itineraries: Itinerary[] = ["Caribbean", "Alaska", "Europe", "Mediterranean"];

  // Use pre-defined realistic ROAS values with differentiation for demo purposes
  // These represent typical cruise industry direct mail ROAS by destination
  const roasMultipliers: Record<Itinerary, number> = {
    Caribbean: 4.2,      // Strong performer - high demand
    Mediterranean: 3.8,  // Good performer - premium pricing
    Europe: 3.1,         // Moderate - seasonal
    Alaska: 2.4,         // Lower - seasonal, cabin mix
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
  const itineraries: Itinerary[] = ["Caribbean", "Alaska", "Europe", "Mediterranean"];

  return itineraries.map((itinerary) => ({
    label: itinerary,
    value: bookings.filter((b) => b.itinerary === itinerary).length,
  }));
}

export function getRevenueByItinerary(): ChartDataPoint[] {
  const itineraries: Itinerary[] = ["Caribbean", "Alaska", "Europe", "Mediterranean"];

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
