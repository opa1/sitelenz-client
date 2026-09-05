"use client";

import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { AnalysisReportData } from "@/lib/types";
import { cn } from "@/lib/utils";

export function RawJsonToggle({ report }: { report: AnalysisReportData }) {
  return (
    <Collapsible className="group/raw-json">
      <CollapsibleTrigger className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ChevronDown className="size-3.5 transition-transform group-data-panel-open/raw-json:rotate-180" />
        Raw JSON
      </CollapsibleTrigger>
      <CollapsibleContent>
        <pre
          className={cn(
            "mt-3 max-h-96 overflow-auto rounded-2xl bg-muted/60 p-4 font-mono text-xs leading-relaxed text-foreground/90",
          )}
        >
          {JSON.stringify(report, null, 2)}
        </pre>
      </CollapsibleContent>
    </Collapsible>
  );
}
