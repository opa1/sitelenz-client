import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisReportData } from "@/lib/types";

const HEADER_LABEL: Record<string, string> = {
  xFrameOptions: "X-Frame-Options",
  referrerPolicy: "Referrer-Policy",
  permissionsPolicy: "Permissions-Policy",
  xContentTypeOptions: "X-Content-Type-Options",
  contentSecurityPolicy: "Content-Security-Policy",
  strictTransportSecurity: "Strict-Transport-Security",
};

const SCORE_BADGE: Record<string, string> = {
  strong: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  weak: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  missing: "bg-destructive/15 text-destructive",
};

export function SecurityTab({ report }: { report: AnalysisReportData }) {
  const security = report.security;

  if (!security) {
    return <p className="text-sm text-muted-foreground">No security data available.</p>;
  }

  const headers = Object.entries(security.headers ?? {}).filter(([, field]) => field);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
        {typeof security.securityScore === "number" && (
          <Card>
            <CardContent className="flex flex-col gap-2 py-6">
              <span className="text-xs text-muted-foreground">Overall security score</span>
              <span className="font-heading text-3xl font-semibold">{security.securityScore}</span>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardContent className="flex flex-col gap-2 py-6">
            <span className="text-xs text-muted-foreground">HTTPS</span>
            <span className="font-heading text-3xl font-semibold">
              {security.https?.enabled ? "Yes" : "No"}
            </span>
            {security.https?.mixedContent && (
              <span className="text-xs text-destructive">Mixed content detected</span>
            )}
          </CardContent>
        </Card>
      </div>

      {headers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Headers</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border">
            {headers.map(([key, field]) => {
              const status = field?.present
                ? (field.correct ?? true)
                  ? (field.score ?? "strong")
                  : "weak"
                : "missing";
              return (
                <div key={key} className="flex items-center justify-between gap-3 py-3.5 text-sm">
                  <span className="truncate font-mono text-xs text-foreground/90">
                    {HEADER_LABEL[key] ?? key}
                  </span>
                  <Badge className={SCORE_BADGE[status] ?? "bg-muted text-muted-foreground"}>
                    {status}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
