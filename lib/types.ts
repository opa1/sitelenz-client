export type Network = "testnet" | "mainnet";

export type AnalysisTier = "standard" | "deep";

export type AnalysisStatusValue = "queued" | "running" | "completed" | "failed";

export interface AnalysisSubmitResponse {
  analysisId: string;
  status: AnalysisStatusValue;
  analysis?: AnalysisTier;
}

export interface AnalysisStatusResponse {
  analysisId: string;
  status: AnalysisStatusValue;
  progressStage?: string;
  // Observed as both a plain string and a structured {code, message} object.
  error?: string | { code?: string; message?: string };
}

export interface HistoryEntry {
  analysisId: string;
  url: string;
  tier: AnalysisTier;
  status: AnalysisStatusValue;
  createdAt: string;
  completedAt?: string;
  /** Cached once the report is fetched, so revisiting a completed analysis
   * from history doesn't re-hit the server. */
  report?: AnalysisReportData;
}

/**
 * Report shape below is modeled directly off a real report payload (not
 * guessed) — every field is still optional and every consumer still renders
 * defensively, since the API contract itself isn't published and could add
 * fields or omit sections we haven't seen yet.
 */

export interface AiRecommendation {
  finding?: string;
  category?: string;
  priority?: "high" | "medium" | "low" | string;
}

export interface AiSection {
  summary?: string;
  modelUsed?: string;
  interpretedAt?: string;
  strengths?: string[];
  weaknesses?: string[];
  notableFindings?: string[];
  recommendations?: AiRecommendation[];
  businessInterpretation?: string;
  technicalInterpretation?: string;
}

export interface TechnologyItem {
  name: string;
  category?: string;
  evidence?: string[];
  confidence?: number;
}

export interface TechnologySection {
  technologies?: TechnologyItem[];
}

/** A field the API reports as `{ value, present, ... }` rather than a bare value. */
export interface SeoField {
  value?: string | null;
  present?: boolean;
  issues?: string[];
  length?: number;
}

export interface SeoMetaTagField {
  value?: string;
  present?: boolean;
}

export interface SeoSection {
  title?: SeoField;
  metaDescription?: SeoField;
  images?: {
    total?: number;
    withAlt?: number;
    missingAlt?: number;
    withEmptyAlt?: number;
    altCoveragePercent?: number;
  };
  robots?: { meta?: string | null; header?: string | null; indexable?: boolean };
  headings?: { issues?: string[]; h1Count?: number; h2Count?: number; h1Values?: string[] };
  canonical?: { value?: string; present?: boolean; matchesCurrentUrl?: boolean };
  openGraph?: {
    url?: SeoMetaTagField;
    type?: SeoMetaTagField;
    image?: SeoMetaTagField;
    title?: SeoMetaTagField;
    description?: SeoMetaTagField;
    complete?: boolean;
  };
  twitterCard?: {
    card?: SeoMetaTagField;
    image?: SeoMetaTagField;
    title?: SeoMetaTagField;
    description?: SeoMetaTagField;
    cardType?: string;
  };
  structuredData?: { items?: unknown[]; types?: string[] };
  lighthouseSeoScore?: number | null;
}

/** A security header's reported check — fields vary a little per header. */
export interface SecurityHeaderField {
  score?: "missing" | "weak" | "strong" | string;
  value?: string | null;
  present?: boolean;
  correct?: boolean;
  maxAge?: number;
  preload?: boolean;
  includeSubDomains?: boolean;
  hasUnsafeEval?: boolean;
  hasUnsafeInline?: boolean;
}

export interface SecuritySection {
  https?: { enabled?: boolean; mixedContent?: boolean };
  headers?: {
    xFrameOptions?: SecurityHeaderField;
    referrerPolicy?: SecurityHeaderField;
    permissionsPolicy?: SecurityHeaderField;
    xContentTypeOptions?: SecurityHeaderField;
    contentSecurityPolicy?: SecurityHeaderField;
    strictTransportSecurity?: SecurityHeaderField;
    [header: string]: SecurityHeaderField | undefined;
  };
  securityScore?: number;
}

export interface PerformanceSection {
  timing?: { loadCompleteMs?: number; domContentLoadedMs?: number };
  caching?: { value?: string; present?: boolean; hasMaxAge?: boolean };
  lighthouse?: {
    cls?: number | null;
    fcp?: number | null;
    lcp?: number | null;
    tbt?: number | null;
    ttfb?: number | null;
    speedIndex?: number | null;
    performanceScore?: number | null;
    accessibilityScore?: number | null;
  };
  pageWeight?: {
    byType?: Record<string, number>;
    totalSizeKb?: number;
    totalRequests?: number;
    totalSizeBytes?: number;
  };
  imageOptimization?: { webp?: boolean; optimized?: boolean; responsive?: boolean };
}

export interface BusinessSourcedValue<T = string> {
  value?: T;
  source?: string;
}

export interface BusinessSection {
  email?: string[];
  phone?: string[];
  ctaUrl?: string | null;
  language?: string;
  pageTitle?: string;
  hasPricing?: boolean;
  primaryCta?: string | null;
  description?: BusinessSourcedValue;
  socialLinks?: string[];
  businessName?: BusinessSourcedValue;
  businessModel?: {
    hasSaasSignals?: BusinessSourcedValue<boolean>;
    hasEcommerceSignals?: BusinessSourcedValue<boolean>;
    hasMarketplaceSignals?: BusinessSourcedValue<boolean>;
  };
  hasContactPage?: boolean;
  hasSupportPage?: boolean;
  hasFreeTrialSignal?: boolean;
  hasEnterpriseSignal?: boolean;
}

export interface UxSection {
  cta?: { count?: number; present?: boolean };
  forms?: {
    formCount?: number;
    hasLoginForm?: boolean;
    hasSearchForm?: boolean;
    hasNewsletterSignal?: boolean;
  };
  content?: { wordCount?: number; hasHeroSection?: boolean };
  viewport?: { hasViewportMeta?: boolean; viewportContent?: string };
  navigation?: { hasNav?: boolean; navItemCount?: number; hasHamburgerSignal?: boolean };
  accessibility?: {
    score?: number | null;
    audits?: { id: string; score: number | null }[];
  };
}

export type ScreenshotType = "desktop" | "mobile";

export interface Screenshot {
  url: string;
  type: ScreenshotType;
  blockerDismissed?: boolean;
}

export interface WebsiteSection {
  finalUrl?: string;
  statusCode?: number;
  redirectChain?: string[];
}

export interface ReportMetadata {
  analysisDurationMs?: number;
  analysisCompletedAt?: string;
}

export interface AnalysisReportData {
  analysisId: string;
  url: string;
  analysisType?: AnalysisTier;
  ai?: AiSection;
  technology?: TechnologySection;
  seo?: SeoSection;
  security?: SecuritySection;
  performance?: PerformanceSection;
  business?: BusinessSection;
  ux?: UxSection;
  screenshots?: Screenshot[];
  website?: WebsiteSection;
  metadata?: ReportMetadata;
  [key: string]: unknown;
}
