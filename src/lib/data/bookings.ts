import type { Booking, Itinerary, CabinType } from "@/types";
import { customers } from "./customers";
import { campaigns } from "./campaigns";

// Seeded random number generator for reproducible data
function seededRandom(seed: number) {
  return function () {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

const random = seededRandom(123);

const itineraries: Itinerary[] = ["Caribbean", "Alaska", "Europe", "Mediterranean"];
const cabinTypes: CabinType[] = ["Inside", "Ocean View", "Balcony", "Suite"];

// Revenue ranges by cabin type
const revenueRanges: Record<CabinType, [number, number]> = {
  Inside: [1800, 3500],
  "Ocean View": [2800, 4500],
  Balcony: [4000, 7000],
  Suite: [7000, 15000],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(random() * arr.length)];
}

function pickWeighted<T>(arr: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = random() * total;
  for (let i = 0; i < arr.length; i++) {
    r -= weights[i];
    if (r <= 0) return arr[i];
  }
  return arr[arr.length - 1];
}

function randomDateBetween(start: Date, end: Date): Date {
  const startTime = start.getTime();
  const endTime = end.getTime();
  return new Date(startTime + random() * (endTime - startTime));
}

function generateBookings(): Booking[] {
  const bookings: Booking[] = [];
  let bookingIndex = 1;

  // Generate bookings from Jan 2024 to Jan 2025
  const startDate = new Date("2024-01-01");
  const endDate = new Date("2025-02-01");

  // For each campaign, generate attributed bookings
  for (const campaign of campaigns) {
    const campaignDate = new Date(campaign.launchDate);
    if (campaignDate > endDate) continue;

    // Determine conversion rate based on campaign type
    const conversionRate =
      campaign.campaignType === "Retargeting" ? 0.015 :
        campaign.campaignType === "Reactivation" ? 0.008 :
          0.003; // Prospecting

    // Calculate expected bookings (for mail campaigns)
    const impressions = campaign.mailVolume > 0 ? campaign.mailVolume : campaign.adSpend * 10;
    const expectedBookings = Math.floor(impressions * conversionRate);

    // Generate bookings for this campaign
    for (let i = 0; i < expectedBookings; i++) {
      const customer = pickRandom(customers);

      // Booking date is 1-60 days after campaign launch
      const bookingDate = new Date(campaignDate);
      bookingDate.setDate(bookingDate.getDate() + Math.floor(random() * 60));
      if (bookingDate > endDate) continue;

      // Sail date is 30-180 days after booking
      const sailDate = new Date(bookingDate);
      sailDate.setDate(sailDate.getDate() + 30 + Math.floor(random() * 150));

      // Itinerary weighted by campaign name hints and general popularity
      let itinerary: Itinerary;
      if (campaign.campaignName.includes("Caribbean")) {
        itinerary = pickWeighted(itineraries, [70, 10, 10, 10]);
      } else if (campaign.campaignName.includes("Alaska")) {
        itinerary = pickWeighted(itineraries, [15, 60, 10, 15]);
      } else if (campaign.campaignName.includes("Mediterranean")) {
        itinerary = pickWeighted(itineraries, [15, 5, 15, 65]);
      } else if (campaign.campaignName.includes("Europe")) {
        itinerary = pickWeighted(itineraries, [15, 10, 55, 20]);
      } else {
        itinerary = pickWeighted(itineraries, [45, 15, 20, 20]);
      }

      // Cabin type - weighted by customer preference and some randomness
      const cabinType = random() > 0.3
        ? customer.preferredCabinType
        : pickWeighted(cabinTypes, [35, 30, 25, 10]);

      // Revenue based on cabin type
      const [minRev, maxRev] = revenueRanges[cabinType];
      const revenue = Math.round(minRev + random() * (maxRev - minRev));

      const isNewCustomer = customer.totalCruises === 1 && random() > 0.7;

      bookings.push({
        bookingId: `book-${String(bookingIndex++).padStart(5, "0")}`,
        customerId: customer.customerId,
        bookingDate: bookingDate.toISOString().split("T")[0],
        sailDate: sailDate.toISOString().split("T")[0],
        itinerary,
        cabinType,
        revenue,
        campaignId: campaign.campaignId,
        isNewCustomer,
      });
    }
  }

  // Add some organic bookings (no campaign attribution)
  const organicBookings = 200;
  for (let i = 0; i < organicBookings; i++) {
    const customer = pickRandom(customers);
    const bookingDate = randomDateBetween(startDate, endDate);
    const sailDate = new Date(bookingDate);
    sailDate.setDate(sailDate.getDate() + 30 + Math.floor(random() * 150));

    const itinerary = pickWeighted(itineraries, [45, 15, 20, 20]);
    const cabinType = random() > 0.4
      ? customer.preferredCabinType
      : pickWeighted(cabinTypes, [35, 30, 25, 10]);

    const [minRev, maxRev] = revenueRanges[cabinType];
    const revenue = Math.round(minRev + random() * (maxRev - minRev));

    bookings.push({
      bookingId: `book-${String(bookingIndex++).padStart(5, "0")}`,
      customerId: customer.customerId,
      bookingDate: bookingDate.toISOString().split("T")[0],
      sailDate: sailDate.toISOString().split("T")[0],
      itinerary,
      cabinType,
      revenue,
      campaignId: null,
      isNewCustomer: false,
    });
  }

  // Sort by booking date
  return bookings.sort((a, b) => a.bookingDate.localeCompare(b.bookingDate));
}

export const bookings: Booking[] = generateBookings();

// Helper functions
export function getBookingsByCampaign(campaignId: string): Booking[] {
  return bookings.filter((b) => b.campaignId === campaignId);
}

export function getBookingsByItinerary(itinerary: Itinerary): Booking[] {
  return bookings.filter((b) => b.itinerary === itinerary);
}

export function getBookingsByCabinType(cabinType: CabinType): Booking[] {
  return bookings.filter((b) => b.cabinType === cabinType);
}

export function getBookingsInDateRange(startDate: string, endDate: string): Booking[] {
  return bookings.filter((b) => b.bookingDate >= startDate && b.bookingDate <= endDate);
}

export function getBookingsByCustomer(customerId: string): Booking[] {
  return bookings.filter((b) => b.customerId === customerId);
}

export function getCampaignAttributedBookings(): Booking[] {
  return bookings.filter((b) => b.campaignId !== null);
}

export function getOrganicBookings(): Booking[] {
  return bookings.filter((b) => b.campaignId === null);
}
