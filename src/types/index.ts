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
export type Itinerary = "Caribbean" | "Alaska" | "Europe" | "Mediterranean" | "Hawaii" | "Asia" | "Australia";
export type CabinType = "Inside" | "Ocean View" | "Balcony" | "Suite";
export type CampaignType = "Prospecting" | "Reactivation" | "Retargeting";
export type MarketingChannel = "Direct Mail" | "Email" | "Display" | "Paid Search" | "Organic Search" | "Pinterest" | "Programmatic Display" | "TikTok";
export type AcquisitionChannel = "Direct Mail" | "Email" | "Organic" | "Referral" | "Paid Search";
export type CustomerSegment = "Prospect" | "Active" | "Lapsed" | "VIP";
export type QualitySegment = 1 | 2 | 3 | 4 | 5; // 1 = Elite/High Intent, 5 = Junk

// NCL CID Types - Visitor Intent Data
export interface EliteHousehold {
  destination: Itinerary;
  eliteHouseholds: number;
  avgPropensityScore: number;
  currentCreativeStrategy: "Matched" | "Generic/Caribbean (Mismatch)";
  estimatedDemandValue: number;
}

export interface ChannelQuality {
  channel: MarketingChannel | "Email (CRM)" | "Google Search" | "Bing Search";
  eliteRate: number;      // % with Score > 2.25 (Buyers)
  junkRate: number;       // % with Score < 0.10 (Bots/Bouncers)
  totalVisitors: number;
  verdict: "Benchmark" | "High Performance" | "Good" | "Waste/Cut" | "Waste/Kill" | "Low Quality";
}

export interface DestinationQuality {
  destination: Itinerary;
  eliteHouseholds: number;
  avgPropensityScore: number;
  retentionWithMatchedCreative: number;  // % retention
  retentionWithGenericCreative: number;  // % retention
  matchedAOV: number;
  mismatchedAOV: number;
  currentMatchRate: number;  // % currently receiving matched creative
}

export interface VisitorProfile {
  visitorId: string;
  destinationIntent: Itinerary;
  propensityScore: number;
  qualitySegment: QualitySegment;
  engagementBehavior: "Cart Abandonment" | "Deck Plan View" | "Itinerary Browse" | "Price Check" | "Bounce";
  sourceChannel: MarketingChannel | "Email (CRM)" | "Google Search" | "Bing Search";
  currentCreativeAssignment: "Matched" | "Generic/Caribbean";
}

export interface RelevancePremium {
  matchedCreativeAOV: number;
  mismatchedCreativeAOV: number;
  aovLift: number;
  aovLiftPercentage: number;
}

export interface GuardrailEffect {
  destination: Itinerary;
  retentionWithMatchedCard: number;
  retentionWithGenericCard: number;
  retentionDrop: number;
  retainedAOV: number;
  switchedAOV: number;
  lossPerSwitch: number;
}

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
  action: "create_audience" | "export_csv" | "schedule_report" | "launch_campaign" | "refine_audience";
  payload?: Record<string, unknown>;
}

export interface VisualizationConfig {
  type: "bar" | "line" | "grouped_bar" | "metrics" | "table" | "funnel" | "audience_preview";
  title?: string;
  data: ChartDataPoint[] | MetricData[] | TableData | FunnelStage[] | AudiencePreviewData;
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

// Funnel visualization types
export interface FunnelStage {
  stage: string;
  count: number;
  conversionRate?: number; // Rate to next stage
}

// Audience builder types
export interface AudienceCriteria {
  segment?: CustomerSegment[];
  loyaltyTier?: Customer["loyaltyTier"][];
  minLTV?: number;
  maxLTV?: number;
  preferredItinerary?: Itinerary[];
  preferredCabinType?: CabinType[];
  churnRisk?: boolean;
  acquisitionChannel?: AcquisitionChannel[];
}

export interface AudiencePreviewData {
  criteria: AudienceCriteria;
  count: number;
  sample: Customer[];
  roiProjection?: ROIProjection;
  recommendation?: CampaignRecommendation;
}

// ROI projection types
export interface ROIProjection {
  audienceSize: number;
  avgOrderValue: number;
  historicalResponseRate: number;
  optimisticRevenue: number;   // 10% conversion
  realisticRevenue: number;    // historical rate
  estimatedCost: number;       // based on mail volume
  estimatedROI: number;        // realistic revenue / cost
}

// Campaign recommendation types
export interface CampaignRecommendation {
  campaignType: CampaignType;
  channel: MarketingChannel;
  messaging: string;
  rationale: string;
  expectedResponseRate: number;
  confidence: "high" | "medium" | "low";
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
