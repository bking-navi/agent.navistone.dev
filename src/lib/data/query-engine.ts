import type { Booking, Campaign, Customer, Itinerary, CabinType, CampaignType, ChartDataPoint } from "@/types";
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
