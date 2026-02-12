// Customer profile
export interface Customer {
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  loyaltyTier: "Bronze" | "Silver" | "Gold" | "Platinum";
  lifetimeValue: number;
  totalCruises: number;
  firstCruiseDate: string;
  lastCruiseDate: string;
  preferredItinerary: Itinerary;
  preferredCabinType: CabinType;
  acquisitionChannel: AcquisitionChannel;
  segment: CustomerSegment;
}

// Booking record
export interface Booking {
  bookingId: string;
  customerId: string;
  bookingDate: string;
  sailDate: string;
  itinerary: Itinerary;
  cabinType: CabinType;
  revenue: number;
  campaignId: string | null;
  isNewCustomer: boolean;
}

// Campaign
export interface Campaign {
  campaignId: string;
  campaignName: string;
  campaignType: CampaignType;
  launchDate: string;
  mailVolume: number;
  adSpend: number;
  channel: MarketingChannel;
}

// Enums / union types
export type Itinerary = "Caribbean" | "Alaska" | "Europe" | "Mediterranean";
export type CabinType = "Inside" | "Ocean View" | "Balcony" | "Suite";
export type CampaignType = "Prospecting" | "Reactivation" | "Retargeting";
export type MarketingChannel = "Direct Mail" | "Email" | "Display";
export type AcquisitionChannel = "Direct Mail" | "Email" | "Organic" | "Referral" | "Paid Search";
export type CustomerSegment = "Prospect" | "Active" | "Lapsed" | "VIP";

// Chat types
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  visualization?: VisualizationConfig;
  data?: Record<string, unknown>[];
  actions?: ActionButton[];
}

export interface ActionButton {
  id: string;
  label: string;
  icon: string;
  action: "create_audience" | "export_csv" | "schedule_report";
  payload?: Record<string, unknown>;
}

export interface VisualizationConfig {
  type: "bar" | "line" | "grouped_bar" | "metrics" | "table";
  title?: string;
  data: ChartDataPoint[] | MetricData[] | TableData;
  xKey?: string;
  yKey?: string;
  groupKey?: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  group?: string;
  color?: string;
}

export interface MetricData {
  label: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
}

export interface TableData {
  columns: { key: string; label: string }[];
  rows: Record<string, unknown>[];
}

// Insight / Alert types
export interface Insight {
  id: string;
  type: "warning" | "success" | "info";
  title: string;
  description: string;
  metric?: string;
  change?: number;
  timestamp: Date;
}

// Query context for conversation memory
export interface QueryContext {
  lastQuery?: string;
  lastDimension?: string;
  lastMetric?: string;
  lastFilters?: Record<string, string[]>;
  lastResults?: Record<string, unknown>[];
}

// API response types
export interface ChatResponse {
  message: ChatMessage;
  context: QueryContext;
}

export interface AnalyticsQuery {
  metric: "roas" | "bookings" | "revenue" | "customers" | "ltv" | "churn_risk";
  dimensions?: string[];
  filters?: Record<string, string[]>;
  timeRange?: { start: string; end: string };
  comparison?: "yoy" | "mom" | "wow";
}
