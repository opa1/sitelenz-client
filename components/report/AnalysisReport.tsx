"use client";

import { ExternalLink, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAnalysisStore } from "@/store/analysisStore";
import { formatTimestamp, getHostname } from "@/lib/format";
import { OverviewTab } from "@/components/report/tabs/OverviewTab";
import { TechnologyTab } from "@/components/report/tabs/TechnologyTab";
import { SeoTab } from "@/components/report/tabs/SeoTab";
import { SecurityTab } from "@/components/report/tabs/SecurityTab";
import { PerformanceTab } from "@/components/report/tabs/PerformanceTab";
import { BusinessTab } from "@/components/report/tabs/BusinessTab";
import { UxTab } from "@/components/report/tabs/UxTab";
import { ScreenshotsTab } from "@/components/report/tabs/ScreenshotsTab";
import { RawJsonToggle } from "@/components/report/RawJsonToggle";

const TIER_LABEL: Record<string, string> = { standard: "Standard", deep: "Deep" };

export function AnalysisReport() {
  const report = useAnalysisStore((s) => s.report);
  const reportLoading = useAnalysisStore((s) => s.reportLoading);
  const error = useAnalysisStore((s) => s.error);
  const url = useAnalysisStore((s) => s.url);
  const tier = useAnalysisStore((s) => s.tier);
  const completedAt = useAnalysisStore((s) => s.completedAt);
  const reset = useAnalysisStore((s) => s.reset);

  const headerScreenshot =
    report?.screenshots?.find((s) => s.type === "desktop")?.url ??
    report?.screenshots?.find((s) => s.type === "mobile")?.url;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-8 py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          {headerScreenshot && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={headerScreenshot}
              alt=""
              className="size-16 shrink-0 rounded-2xl border border-border object-cover"
            />
          )}
          <div className="flex min-w-0 flex-col gap-1.5">
            {url && (
              <h1 className="truncate text-xl font-semibold text-foreground" title={url}>
                {getHostname(url)}
              </h1>
            )}
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground hover:underline"
              >
                <span className="truncate">{url}</span>
                <ExternalLink className="size-3.5 shrink-0" />
              </a>
            )}
            <div className="flex items-center gap-3 pt-0.5">
              {tier && <Badge variant="secondary">{TIER_LABEL[tier] ?? tier}</Badge>}
              <span className="text-sm text-muted-foreground">{formatTimestamp(completedAt ?? undefined)}</span>
            </div>
          </div>
        </div>
        <Button variant="outline" size="lg" onClick={reset} className="shrink-0">
          <Plus />
          New Analysis
        </Button>
      </div>

      <Separator />

      {reportLoading && (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-72 rounded-full" />
          <Skeleton className="h-56 w-full rounded-3xl" />
          <Skeleton className="h-56 w-full rounded-3xl" />
        </div>
      )}

      {!reportLoading && error && <p className="text-sm text-destructive">{error}</p>}

      {!reportLoading && report && (
        <>
          <Tabs defaultValue="overview" className="gap-4">
            <div className="-mx-8 overflow-x-auto px-8">
              <TabsList className="p-1.5">
                <TabsTrigger value="overview" className="shrink-0">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="technology" className="shrink-0">
                  Technology
                </TabsTrigger>
                <TabsTrigger value="seo" className="shrink-0">
                  SEO
                </TabsTrigger>
                <TabsTrigger value="security" className="shrink-0">
                  Security
                </TabsTrigger>
                <TabsTrigger value="performance" className="shrink-0">
                  Performance
                </TabsTrigger>
                <TabsTrigger value="business" className="shrink-0">
                  Business
                </TabsTrigger>
                <TabsTrigger value="ux" className="shrink-0">
                  UX
                </TabsTrigger>
                <TabsTrigger value="screenshots" className="shrink-0">
                  Screenshots
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview">
              <OverviewTab report={report} />
            </TabsContent>
            <TabsContent value="technology">
              <TechnologyTab report={report} />
            </TabsContent>
            <TabsContent value="seo">
              <SeoTab report={report} />
            </TabsContent>
            <TabsContent value="security">
              <SecurityTab report={report} />
            </TabsContent>
            <TabsContent value="performance">
              <PerformanceTab report={report} />
            </TabsContent>
            <TabsContent value="business">
              <BusinessTab report={report} />
            </TabsContent>
            <TabsContent value="ux">
              <UxTab report={report} />
            </TabsContent>
            <TabsContent value="screenshots">
              <ScreenshotsTab report={report} />
            </TabsContent>
          </Tabs>

          <Separator />
          <RawJsonToggle report={report} />
        </>
      )}
    </div>
  );
}
