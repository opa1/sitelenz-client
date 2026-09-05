"use client";

import { useEffect, useState } from "react";
import { BookOpen, GitFork, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAnalysisStore } from "@/store/analysisStore";
import { getHistory } from "@/lib/history";
import { relativeTime, truncateUrl } from "@/lib/format";
import { DOCS_URL, GITHUB_URL } from "@/lib/env";
import { cn } from "@/lib/utils";
import type { HistoryEntry } from "@/lib/types";

const STATUS_BADGE: Record<string, string> = {
  queued: "bg-muted text-muted-foreground",
  running: "bg-blue-500/15 text-blue-600 dark:text-blue-400 animate-pulse",
  completed: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  failed: "bg-destructive/15 text-destructive",
};

const TIER_LABEL: Record<string, string> = { standard: "Standard", deep: "Deep" };

/** Shared content for both the desktop fixed panel and the mobile drawer. */
export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const status = useAnalysisStore((s) => s.status);
  const view = useAnalysisStore((s) => s.view);
  const analysisId = useAnalysisStore((s) => s.analysisId);
  const loadFromHistory = useAnalysisStore((s) => s.loadFromHistory);
  const reset = useAnalysisStore((s) => s.reset);
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    // Re-reads localStorage (an external store) whenever the active analysis
    // changes it; not state derived from props/state, so no cascade risk.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntries(getHistory());
  }, [status, view, analysisId]);

  const handleSelect = (entry: HistoryEntry) => {
    loadFromHistory(entry);
    onNavigate?.();
  };

  const handleNew = () => {
    reset();
    onNavigate?.();
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <Button variant="outline" size="lg" className="w-full" onClick={handleNew}>
        <Plus />
        New
      </Button>

      {(DOCS_URL || GITHUB_URL) && (
        <div className="flex flex-col gap-1.5">
          {DOCS_URL && (
            <Button
              variant="ghost"
              className="h-12 justify-start gap-3 px-4 text-base"
              nativeButton={false}
              render={<a href={DOCS_URL} target="_blank" rel="noreferrer" />}
            >
              <BookOpen />
              Docs
            </Button>
          )}
          {GITHUB_URL && (
            <Button
              variant="ghost"
              className="h-12 justify-start gap-3 px-4 text-base"
              nativeButton={false}
              render={<a href={GITHUB_URL} target="_blank" rel="noreferrer" />}
            >
              <GitFork />
              Github
            </Button>
          )}
        </div>
      )}

      <Separator />

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-2.5 pr-3">
          {entries.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">No analyses yet</p>
          )}
          {entries.map((entry) => (
            <button
              key={entry.analysisId}
              onClick={() => handleSelect(entry)}
              className={cn(
                "flex flex-col gap-2 rounded-2xl px-4 py-4 text-left text-base transition-colors hover:bg-muted",
                analysisId === entry.analysisId && "bg-muted",
              )}
            >
              <span className="truncate font-medium">{truncateUrl(entry.url)}</span>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{TIER_LABEL[entry.tier] ?? entry.tier}</Badge>
                  <Badge className={STATUS_BADGE[entry.status]}>{entry.status}</Badge>
                </div>
                <span className="shrink-0 text-sm text-muted-foreground">
                  {relativeTime(entry.createdAt)}
                </span>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
