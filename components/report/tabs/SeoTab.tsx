import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { AnalysisReportData } from "@/lib/types";

function CheckRow({ label, ok }: { label: string; ok?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 text-sm">
      <span className="text-foreground/90">{label}</span>
      {ok ? (
        <Check className="size-4 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <X className="size-4 text-destructive" />
      )}
    </div>
  );
}

export function SeoTab({ report }: { report: AnalysisReportData }) {
  const seo = report.seo;

  if (!seo) {
    return <p className="text-sm text-muted-foreground">No SEO data available.</p>;
  }

  const structuredDataTypes = seo.structuredData?.types ?? [];

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Meta</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Title length</span>
            <span>
              {seo.title?.length ?? "—"}
              {seo.title?.issues && seo.title.issues.length > 0 && (
                <span className="ml-1.5 text-xs text-amber-600 dark:text-amber-400">
                  ({seo.title.issues.join(", ").replace(/_/g, " ")})
                </span>
              )}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Description length</span>
            <span>
              {seo.metaDescription?.length ?? "—"}
              {seo.metaDescription?.issues && seo.metaDescription.issues.length > 0 && (
                <span className="ml-1.5 text-xs text-amber-600 dark:text-amber-400">
                  ({seo.metaDescription.issues.join(", ").replace(/_/g, " ")})
                </span>
              )}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="shrink-0 text-muted-foreground">Canonical</span>
            <span className="truncate font-mono text-xs">{seo.canonical?.value ?? "—"}</span>
          </div>
          {typeof seo.lighthouseSeoScore === "number" && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lighthouse SEO score</span>
              <span className="font-medium">{seo.lighthouseSeoScore}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <CheckRow label="Open Graph tags" ok={seo.openGraph?.complete} />
          <Separator />
          <CheckRow label="Twitter card" ok={!!seo.twitterCard?.card?.present} />
          <Separator />
          <CheckRow label="Indexable" ok={seo.robots?.indexable} />
        </CardContent>
      </Card>

      {seo.headings && (seo.headings.h1Count !== undefined || seo.headings.h2Count !== undefined) && (
        <Card>
          <CardHeader>
            <CardTitle>Heading structure</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline">H1 × {seo.headings.h1Count ?? 0}</Badge>
              <Badge variant="outline">H2 × {seo.headings.h2Count ?? 0}</Badge>
            </div>
            {seo.headings.h1Values?.map((text, i) => (
              <p key={i} className="truncate text-sm text-foreground/90">
                {text}
              </p>
            ))}
            {seo.headings.issues && seo.headings.issues.length > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                {seo.headings.issues.join(", ")}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {seo.images && (
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total images</span>
              <span>{seo.images.total ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Alt text coverage</span>
              <span>{seo.images.altCoveragePercent ?? 0}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Missing alt text</span>
              <span>{seo.images.missingAlt ?? 0}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {structuredDataTypes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Structured data</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {structuredDataTypes.map((type) => (
              <Badge key={type} variant="secondary">
                {type}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
