import { Check, X } from "lucide-react";
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

export function UxTab({ report }: { report: AnalysisReportData }) {
  const ux = report.ux;

  if (!ux) {
    return <p className="text-sm text-muted-foreground">No UX data available.</p>;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <CheckRow label="Viewport meta tag" ok={ux.viewport?.hasViewportMeta} />
          <Separator />
          <CheckRow label="Navigation" ok={ux.navigation?.hasNav} />
          <Separator />
          <CheckRow label="Hero section" ok={ux.content?.hasHeroSection} />
          <Separator />
          <CheckRow label="Search form" ok={ux.forms?.hasSearchForm} />
          <Separator />
          <CheckRow label="Login form" ok={ux.forms?.hasLoginForm} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scores</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Accessibility score</span>
            <span className="font-heading text-2xl font-semibold">
              {ux.accessibility?.score ?? "—"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">CTA count</span>
            <span className="font-heading text-2xl font-semibold">{ux.cta?.count ?? "—"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Nav items</span>
            <span className="font-heading text-2xl font-semibold">
              {ux.navigation?.navItemCount ?? "—"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Word count</span>
            <span className="font-heading text-2xl font-semibold">
              {ux.content?.wordCount ?? "—"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
