import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisReportData, TechnologyItem } from "@/lib/types";

const CATEGORY_LABEL: Record<string, string> = {
  framework: "Framework",
  cms: "CMS",
  infrastructure: "Infrastructure",
  infra: "Infrastructure",
  analytics: "Analytics",
  payments: "Payments",
  font: "Fonts",
  fonts: "Fonts",
};

export function TechnologyTab({ report }: { report: AnalysisReportData }) {
  const technologies = report.technology?.technologies ?? [];

  if (technologies.length === 0) {
    return <p className="text-sm text-muted-foreground">No technology data available.</p>;
  }

  const byCategory = new Map<string, TechnologyItem[]>();
  for (const item of technologies) {
    const key = item.category ?? "other";
    byCategory.set(key, [...(byCategory.get(key) ?? []), item]);
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {[...byCategory.entries()].map(([category, items]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>{CATEGORY_LABEL[category] ?? category}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {items.map((item) => {
              const confidence =
                typeof item.confidence === "number"
                  ? `${Math.round(item.confidence * 100)}% confidence`
                  : undefined;
              const evidence = item.evidence?.join("; ");
              const title = [confidence, evidence].filter(Boolean).join(" — ") || undefined;
              return (
                <Badge key={item.name} variant="secondary" title={title}>
                  {item.name}
                </Badge>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
