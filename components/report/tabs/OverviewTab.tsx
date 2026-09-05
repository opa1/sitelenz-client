import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Briefcase, Code2, FileText, Lightbulb, Sparkles, ThumbsDown, ThumbsUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AiRecommendation, AnalysisReportData } from "@/lib/types";

const PRIORITY_ORDER = ["high", "medium", "low"];
const PRIORITY_LABEL: Record<string, string> = { high: "High", medium: "Medium", low: "Low" };
const PRIORITY_BADGE: Record<string, string> = {
  high: "bg-destructive/15 text-destructive",
  medium: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  low: "bg-muted text-muted-foreground",
};

/** Icon rendered in front of a card's title, in an elevated rounded tile. */
function SectionTitle({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <CardTitle className="flex items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted p-2 shadow-sm ring-1 ring-foreground/5">
        <Icon className="size-4 text-foreground/80" />
      </span>
      {children}
    </CardTitle>
  );
}

/** Strengths/weaknesses render as ordinary numbered text, not badge pills. */
function NumberedList({ items }: { items: string[] }) {
  return (
    <ol className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm text-foreground/90">
          <span className="shrink-0 text-muted-foreground">{i + 1}.</span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
}

export function OverviewTab({ report }: { report: AnalysisReportData }) {
  const ai = report.ai;

  if (!ai) {
    return <p className="text-sm text-muted-foreground">No overview data available.</p>;
  }

  const grouped = new Map<string, AiRecommendation[]>();
  for (const rec of ai.recommendations ?? []) {
    const key = rec.priority ?? "other";
    grouped.set(key, [...(grouped.get(key) ?? []), rec]);
  }
  const priorityKeys = [
    ...PRIORITY_ORDER.filter((p) => grouped.has(p)),
    ...[...grouped.keys()].filter((k) => !PRIORITY_ORDER.includes(k)),
  ];

  return (
    <div className="flex flex-col gap-8">
      {ai.summary && (
        <Card>
          <CardHeader>
            <SectionTitle icon={FileText}>Summary</SectionTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground/90">{ai.summary}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        {ai.strengths && ai.strengths.length > 0 && (
          <Card>
            <CardHeader>
              <SectionTitle icon={ThumbsUp}>Strengths</SectionTitle>
            </CardHeader>
            <CardContent>
              <NumberedList items={ai.strengths} />
            </CardContent>
          </Card>
        )}

        {ai.weaknesses && ai.weaknesses.length > 0 && (
          <Card>
            <CardHeader>
              <SectionTitle icon={ThumbsDown}>Weaknesses</SectionTitle>
            </CardHeader>
            <CardContent>
              <NumberedList items={ai.weaknesses} />
            </CardContent>
          </Card>
        )}
      </div>

      {ai.notableFindings && ai.notableFindings.length > 0 && (
        <Card>
          <CardHeader>
            <SectionTitle icon={Sparkles}>Notable Findings</SectionTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {ai.notableFindings.map((finding, i) => (
                <li key={i} className="text-sm text-foreground/90">
                  {finding}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {priorityKeys.length > 0 && (
        <Card>
          <CardHeader>
            <SectionTitle icon={Lightbulb}>Recommendations</SectionTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {priorityKeys.map((key) => (
              <div key={key} className="flex flex-col gap-3">
                <Badge className={PRIORITY_BADGE[key] ?? "bg-muted text-muted-foreground"}>
                  {PRIORITY_LABEL[key] ?? key}
                </Badge>
                <ul className="flex flex-col gap-2">
                  {grouped.get(key)?.map((rec, i) => (
                    <li key={i} className="text-sm text-foreground/90">
                      {rec.category && (
                        <span className="mr-1.5 font-medium capitalize">{rec.category}:</span>
                      )}
                      {rec.finding}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {(ai.businessInterpretation || ai.technicalInterpretation) && (
        <div className="grid gap-6 sm:grid-cols-2">
          {ai.businessInterpretation && (
            <Card>
              <CardHeader>
                <SectionTitle icon={Briefcase}>Business Interpretation</SectionTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-foreground/90">
                  {ai.businessInterpretation}
                </p>
              </CardContent>
            </Card>
          )}
          {ai.technicalInterpretation && (
            <Card>
              <CardHeader>
                <SectionTitle icon={Code2}>Technical Interpretation</SectionTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-foreground/90">
                  {ai.technicalInterpretation}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
