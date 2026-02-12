import type { Customer, Itinerary, CabinType, AcquisitionChannel, CustomerSegment } from "@/types";

// Seeded random number generator for reproducible data
function seededRandom(seed: number) {
  return function () {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

const random = seededRandom(42);

const firstNames = [
  "James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda",
  "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
  "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Lisa", "Daniel", "Nancy",
  "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley",
  "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle",
  "Kenneth", "Dorothy", "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa",
  "Timothy", "Deborah", "Ronald", "Stephanie", "Edward", "Rebecca", "Jason", "Sharon",
  "Jeffrey", "Laura", "Ryan", "Cynthia", "Jacob", "Kathleen", "Gary", "Amy",
  "Nicholas", "Angela", "Eric", "Shirley", "Jonathan", "Anna", "Stephen", "Brenda",
  "Larry", "Pamela", "Justin", "Emma", "Scott", "Nicole", "Brandon", "Helen",
];

const lastNames = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas",
  "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White",
  "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young",
  "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
  "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
  "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker",
  "Cruz", "Edwards", "Collins", "Reyes", "Stewart", "Morris", "Morales", "Murphy",
];

const itineraries: Itinerary[] = ["Caribbean", "Alaska", "Europe", "Mediterranean"];
const cabinTypes: CabinType[] = ["Inside", "Ocean View", "Balcony", "Suite"];
const acquisitionChannels: AcquisitionChannel[] = ["Direct Mail", "Email", "Organic", "Referral", "Paid Search"];
const loyaltyTiers: Customer["loyaltyTier"][] = ["Bronze", "Silver", "Gold", "Platinum"];

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

function generateCustomer(index: number): Customer {
  const firstName = pickRandom(firstNames);
  const lastName = pickRandom(lastNames);
  const customerId = `cust-${String(index).padStart(4, "0")}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@example.com`;

  // Weighted distributions for realistic data
  const loyaltyTier = pickWeighted(loyaltyTiers, [50, 30, 15, 5]); // Most customers are Bronze
  const totalCruises = loyaltyTier === "Platinum" ? 8 + Math.floor(random() * 15) :
    loyaltyTier === "Gold" ? 4 + Math.floor(random() * 6) :
      loyaltyTier === "Silver" ? 2 + Math.floor(random() * 3) :
        1 + Math.floor(random() * 2);

  const avgCruiseValue = pickWeighted(
    [2500, 3500, 5000, 8000],
    cabinTypes.map((_, i) => [40, 30, 20, 10][i])
  );
  const lifetimeValue = totalCruises * avgCruiseValue * (0.8 + random() * 0.4);

  // Date calculations
  const now = new Date("2025-02-01");
  const yearsAsCustomer = totalCruises * 0.5 + random() * 2;
  const firstCruiseDate = new Date(now);
  firstCruiseDate.setFullYear(firstCruiseDate.getFullYear() - Math.floor(yearsAsCustomer));
  firstCruiseDate.setMonth(Math.floor(random() * 12));

  // Last cruise date - some recent, some lapsed
  const lastCruiseDate = new Date(now);
  const monthsAgo = loyaltyTier === "Platinum" ? Math.floor(random() * 6) :
    loyaltyTier === "Gold" ? Math.floor(random() * 12) :
      loyaltyTier === "Silver" ? Math.floor(random() * 18) :
        Math.floor(random() * 30); // Bronze customers may be very lapsed
  lastCruiseDate.setMonth(lastCruiseDate.getMonth() - monthsAgo);

  // Preferred itinerary - weighted by popularity
  const preferredItinerary = pickWeighted(itineraries, [45, 15, 20, 20]);

  // Cabin preference - correlated with loyalty tier
  const cabinWeights = loyaltyTier === "Platinum" ? [5, 15, 30, 50] :
    loyaltyTier === "Gold" ? [10, 25, 40, 25] :
      loyaltyTier === "Silver" ? [25, 35, 30, 10] :
        [40, 35, 20, 5];
  const preferredCabinType = pickWeighted(cabinTypes, cabinWeights);

  const acquisitionChannel = pickWeighted(acquisitionChannels, [35, 25, 20, 10, 10]);

  // Segment based on recency and value
  let segment: CustomerSegment;
  if (lifetimeValue > 50000 && monthsAgo < 12) {
    segment = "VIP";
  } else if (monthsAgo > 18) {
    segment = "Lapsed";
  } else if (totalCruises === 1 && monthsAgo > 12) {
    segment = "Prospect";
  } else {
    segment = "Active";
  }

  return {
    customerId,
    firstName,
    lastName,
    email,
    loyaltyTier,
    lifetimeValue: Math.round(lifetimeValue),
    totalCruises,
    firstCruiseDate: firstCruiseDate.toISOString().split("T")[0],
    lastCruiseDate: lastCruiseDate.toISOString().split("T")[0],
    preferredItinerary,
    preferredCabinType,
    acquisitionChannel,
    segment,
  };
}

// Generate 500 customers
export const customers: Customer[] = Array.from({ length: 500 }, (_, i) => generateCustomer(i + 1));

// Helper functions
export function getCustomerById(customerId: string): Customer | undefined {
  return customers.find((c) => c.customerId === customerId);
}

export function getCustomersBySegment(segment: CustomerSegment): Customer[] {
  return customers.filter((c) => c.segment === segment);
}

export function getCustomersByLoyaltyTier(tier: Customer["loyaltyTier"]): Customer[] {
  return customers.filter((c) => c.loyaltyTier === tier);
}

export function getChurnRiskCustomers(monthsThreshold: number = 18): Customer[] {
  const cutoffDate = new Date("2025-02-01");
  cutoffDate.setMonth(cutoffDate.getMonth() - monthsThreshold);

  return customers.filter((c) => {
    const lastCruise = new Date(c.lastCruiseDate);
    return lastCruise < cutoffDate && c.segment !== "VIP";
  });
}

export function getHighValueCustomers(minLTV: number = 25000): Customer[] {
  return customers.filter((c) => c.lifetimeValue >= minLTV);
}
