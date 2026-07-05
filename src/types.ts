export interface AdReport {
  id: string;
  campaign: string;
  status: string;
  reportStart?: string | null;
  reportEnd?: string | null;
  results?: number | null;
  resultIndicator?: string | null;
  reach?: number | null;
  frequency?: number | null;
  costPerResult?: number | null;
  budget?: number | null;
  budgetType?: string | null;
  spend?: number | null;
  endDate?: string | null;
  impressions?: number | null;
  cpm?: number | null;
  linkClicks?: number | null;
  cpcLink?: number | null;
  ctrLink?: number | null;
  allClicks?: number | null;
  ctrAll?: number | null;
  cpcAll?: number | null;
  landingViews?: number | null;
  costPerLanding?: number | null;
  label: string;
  uploadedAt: string;
  source: string;
}

export interface Collection {
  id: string;
  name: string;
  adIds: string[];
  createdAt: string;
}

export interface AggregationResult {
  totalSpend: number;
  totalImpr: number;
  totalReach: number;
  totalAllClicks: number;
  totalLinkClicks: number;
  totalLanding: number;
  avgCtrAll: number | null;
  avgCtrLink: number | null;
  avgCpcAll: number | null;
  avgCpcLink: number | null;
  avgCpm: number | null;
}
