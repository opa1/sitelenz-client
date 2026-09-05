import { Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBytes } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AnalysisReportData } from "@/lib/types";

const RATING_CLASS: Record<string, string> = {
  good: "text-emerald-600 dark:text-emerald-400",
  "needs-improvement": "text-amber-600 dark:text-amber-400",
  poor: "text-destructive",
};

// The API reports raw Lighthouse numbers with no pre-computed rating, so we
// apply the standard Core Web Vitals thresholds ourselves.
const VITAL_THRESHOLDS: Record<string, { good: number; poor: number; unit: string }> = {
  lcp: { good: 2500, poor: 4000, unit: "ms" },
  fcp: { good: 1800, poor: 3000, unit: "ms" },
  tbt: { good: 200, poor: 600, unit: "ms" },
  ttfb: { good: 800, poor: 1800, unit: "ms" },
  cls: { good: 0.1, poor: 0.25, unit: "" },
  speedIndex: { good: 3400, poor: 5800, unit: "ms" },
};

const VITAL_LABEL: Record<string, string> = {
  lcp: "LCP",
  fcp: "FCP",
  tbt: "TBT",
  ttfb: "TTFB",
  cls: "CLS",
  speedIndex: "Speed Index",
};

function rate(id: string, value: number): string {
  const threshold = VITAL_THRESHOLDS[id];
  if (!threshold) return "";
  if (value <= threshold.good) return "good";
  if (value > threshold.poor) return "poor";
  return "needs-improvement";
}

function VitalCard({ id, value }: { id: string; value: number }) {
  const rating = rate(id, value);
  const ratingClass = RATING_CLASS[rating];
  const unit = VITAL_THRESHOLDS[id]?.unit ?? "";
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-muted/50 px-5 py-4">
      <span className="text-xs text-muted-foreground">{VITAL_LABEL[id] ?? id.toUpperCase()}</span>
      <span className={cn("font-heading text-2xl font-semibold", ratingClass)}>
        {unit === "ms" ? Math.round(value) : value}
        {unit && <span className="ml-0.5 text-sm font-normal">{unit}</span>}
      </span>
      {rating && <span className={cn("text-xs capitalize", ratingClass)}>{rating}</span>}
    </div>
  );
}

function ScoreCard({ label, score }: { label: string; score?: number | null }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 py-6">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="font-heading text-3xl font-semibold">{score ?? "—"}</span>
      </CardContent>
    </Card>
  );
}

function CheckRow({ label, ok }: { label: string; ok?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-foreground/90">{label}</span>
      {ok ? (
        <Check className="size-4 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <X className="size-4 text-destructive" />
      )}
    </div>
  );
}

export function PerformanceTab({ report }: { report: AnalysisReportData }) {
  const performance = report.performance;

  if (!performance) {
    return <p className="text-sm text-muted-foreground">No performance data available.</p>;
  }

  const vitals = Object.entries(performance.lighthouse ?? {}).filter(
    (entry): entry is [string, number] =>
      entry[0] in VITAL_THRESHOLDS && typeof entry[1] === "number",
  );

  const byType = Object.entries(performance.pageWeight?.byType ?? {});

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        <ScoreCard label="Lighthouse Performance" score={performance.lighthouse?.performanceScore} />
        <ScoreCard
          label="Lighthouse Accessibility"
          score={performance.lighthouse?.accessibilityScore}
        />
        <Card>
          <CardContent className="flex flex-col gap-2 py-6">
            <span className="text-xs text-muted-foreground">Page weight</span>
            <span className="font-heading text-3xl font-semibold">
              {formatBytes(performance.pageWeight?.totalSizeBytes)}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-2 py-6">
            <span className="text-xs text-muted-foreground">Requests</span>
            <span className="font-heading text-3xl font-semibold">
              {performance.pageWeight?.totalRequests ?? "—"}
            </span>
          </CardContent>
        </Card>
      </div>

      {performance.timing && (
        <Card>
          <CardHeader>
            <CardTitle>Timing</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 rounded-2xl bg-muted/50 px-5 py-4">
              <span className="text-xs text-muted-foreground">DOM content loaded</span>
              <span className="font-heading text-xl font-semibold">
                {performance.timing.domContentLoadedMs !== undefined
                  ? `${Math.round(performance.timing.domContentLoadedMs)}ms`
                  : "—"}
              </span>
            </div>
            <div className="flex flex-col gap-1 rounded-2xl bg-muted/50 px-5 py-4">
              <span className="text-xs text-muted-foreground">Load complete</span>
              <span className="font-heading text-xl font-semibold">
                {performance.timing.loadCompleteMs !== undefined
                  ? `${Math.round(performance.timing.loadCompleteMs)}ms`
                  : "—"}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {vitals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Core Web Vitals</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {vitals.map(([id, value]) => (
              <VitalCard key={id} id={id} value={value} />
            ))}
          </CardContent>
        </Card>
      )}

      {(performance.caching || performance.imageOptimization) && (
        <Card>
          <CardHeader>
            <CardTitle>Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            {performance.caching && <CheckRow label="Caching enabled" ok={performance.caching.present} />}
            {performance.imageOptimization && (
              <>
                <CheckRow label="Images optimized" ok={performance.imageOptimization.optimized} />
                <CheckRow label="WebP images" ok={performance.imageOptimization.webp} />
                <CheckRow label="Responsive images" ok={performance.imageOptimization.responsive} />
              </>
            )}
          </CardContent>
        </Card>
      )}

      {byType.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Requests by type</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {byType.map(([type, count]) => (
              <span
                key={type}
                className="rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground capitalize"
              >
                {type}: {count}
              </span>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
