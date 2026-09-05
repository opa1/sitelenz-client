import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisReportData } from "@/lib/types";

export function ScreenshotsTab({ report }: { report: AnalysisReportData }) {
  const screenshots = report.screenshots ?? [];
  const desktop = screenshots.find((s) => s.type === "desktop");
  const mobile = screenshots.find((s) => s.type === "mobile");

  if (!desktop && !mobile) {
    return <p className="text-sm text-muted-foreground">No screenshots available.</p>;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {desktop && (
        <Card>
          <CardHeader>
            <CardTitle>Desktop</CardTitle>
          </CardHeader>
          <CardContent>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={desktop.url}
              alt="Desktop screenshot"
              className="w-full rounded-2xl border border-border"
            />
          </CardContent>
        </Card>
      )}
      {mobile && (
        <Card>
          <CardHeader>
            <CardTitle>Mobile</CardTitle>
          </CardHeader>
          <CardContent>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mobile.url}
              alt="Mobile screenshot"
              className="mx-auto max-w-[280px] rounded-2xl border border-border"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
