"use client";

import type { AudiencePreviewData, ActionButton } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, Target, Rocket, Settings, Sparkles } from "lucide-react";

interface AudiencePreviewProps {
  data: AudiencePreviewData;
  onAction?: (action: ActionButton) => void;
}

// Format criteria into readable tags
function formatCriteria(criteria: AudiencePreviewData["criteria"]): string[] {
  const tags: string[] = [];
  
  if (criteria.segment && criteria.segment.length > 0) {
    tags.push(`Segment: ${criteria.segment.join(", ")}`);
  }
  if (criteria.loyaltyTier && criteria.loyaltyTier.length > 0) {
    tags.push(`Tier: ${criteria.loyaltyTier.join(", ")}`);
  }
  if (criteria.minLTV !== undefined) {
    tags.push(`LTV > $${criteria.minLTV.toLocaleString()}`);
  }
  if (criteria.maxLTV !== undefined) {
    tags.push(`LTV < $${criteria.maxLTV.toLocaleString()}`);
  }
  if (criteria.preferredItinerary && criteria.preferredItinerary.length > 0) {
    tags.push(`Itinerary: ${criteria.preferredItinerary.join(", ")}`);
  }
  if (criteria.preferredCabinType && criteria.preferredCabinType.length > 0) {
    tags.push(`Cabin: ${criteria.preferredCabinType.join(", ")}`);
  }
  if (criteria.churnRisk) {
    tags.push("Churn Risk");
  }
  if (criteria.acquisitionChannel && criteria.acquisitionChannel.length > 0) {
    tags.push(`Channel: ${criteria.acquisitionChannel.join(", ")}`);
  }
  
  return tags;
}

export function AudiencePreview({ data, onAction }: AudiencePreviewProps) {
  const criteriaStrings = formatCriteria(data.criteria);
  
  return (
    <div className="space-y-3">
      {/* Audience summary card */}
      <div className="rounded-lg border bg-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <span className="font-semibold">Audience Preview</span>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold tabular-nums">{data.count.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">matching customers</p>
          </div>
        </div>
        
        {/* Criteria tags */}
        <div className="p-4 border-b">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Criteria
          </p>
          <div className="flex flex-wrap gap-1.5">
            {criteriaStrings.map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Sample customers table */}
        {data.sample.length > 0 && (
          <div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30">
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Tier</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">LTV</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Preference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted/50">
                {data.sample.map((customer) => (
                  <tr key={customer.customerId} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2.5 font-medium">{customer.firstName} {customer.lastName}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant="outline" className="text-xs font-normal">
                        {customer.loyaltyTier}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                      ${customer.lifetimeValue.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {customer.preferredItinerary}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.count > 5 && (
              <div className="px-4 py-2 text-xs text-muted-foreground bg-muted/20 border-t">
                Showing 5 of {data.count.toLocaleString()} matching customers
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* ROI Projection card */}
      {data.roiProjection && (
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <span className="font-semibold">ROI Projection</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Realistic</p>
              <p className="text-2xl font-bold text-emerald-600 tabular-nums">
                ${data.roiProjection.realisticRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                at {(data.roiProjection.historicalResponseRate * 100).toFixed(1)}% response
              </p>
            </div>
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Optimistic</p>
              <p className="text-2xl font-bold text-blue-600 tabular-nums">
                ${data.roiProjection.optimisticRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                at 10% response
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t text-sm">
            <span className="text-muted-foreground">
              Est. Cost: <span className="font-medium text-foreground">${data.roiProjection.estimatedCost.toLocaleString()}</span>
            </span>
            <span className="font-semibold text-emerald-600">
              Est. ROI: {data.roiProjection.estimatedROI.toFixed(1)}x
            </span>
          </div>
        </div>
      )}
      
      {/* Campaign Recommendation card */}
      {data.recommendation && (
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-full bg-violet-500/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-violet-600" />
            </div>
            <span className="font-semibold">Campaign Recommendation</span>
            <Badge 
              variant={
                data.recommendation.confidence === "high" ? "default" : 
                data.recommendation.confidence === "medium" ? "secondary" : "outline"
              }
              className="ml-auto text-xs capitalize"
            >
              {data.recommendation.confidence} confidence
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-violet-600">{data.recommendation.campaignType}</Badge>
              <Badge variant="outline">{data.recommendation.channel}</Badge>
              <span className="text-sm text-muted-foreground ml-auto">
                {(data.recommendation.expectedResponseRate * 100).toFixed(1)}% expected response
              </span>
            </div>
            
            <div className="rounded-lg bg-muted/30 p-3 space-y-2">
              <p className="text-sm">
                <span className="font-medium text-muted-foreground">Messaging: </span>
                <span>{data.recommendation.messaging}</span>
              </p>
              
              <p className="text-sm">
                <span className="font-medium text-muted-foreground">Rationale: </span>
                <span className="text-muted-foreground">{data.recommendation.rationale}</span>
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Action buttons */}
      {onAction && (
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onAction({
              id: "create-audience",
              label: "Create Audience",
              icon: "users",
              action: "create_audience",
              payload: { criteria: data.criteria, count: data.count },
            })}
          >
            <Users className="h-4 w-4 mr-2" />
            Create Audience
          </Button>
          
          {data.recommendation && (
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => onAction({
                id: "launch-campaign",
                label: "Launch Campaign",
                icon: "rocket",
                action: "launch_campaign",
                payload: { 
                  criteria: data.criteria, 
                  count: data.count,
                  recommendation: data.recommendation,
                },
              })}
            >
              <Rocket className="h-4 w-4 mr-2" />
              Launch Campaign
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction({
              id: "refine-audience",
              label: "Refine Criteria",
              icon: "settings",
              action: "refine_audience",
              payload: { criteria: data.criteria },
            })}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
