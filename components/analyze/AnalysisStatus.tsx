"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAnalysisStore } from "@/store/analysisStore";
import { formatElapsed } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS_BADGE: Record<string, string> = {
  queued: "bg-muted text-muted-foreground",
  running: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
};

export function AnalysisStatus() {
  const analysisId = useAnalysisStore((s) => s.analysisId);
  const status = useAnalysisStore((s) => s.status);
  const progressStage = useAnalysisStore((s) => s.progressStage);
  const createdAt = useAnalysisStore((s) => s.createdAt);
  const error = useAnalysisStore((s) => s.error);
  const url = useAnalysisStore((s) => s.url);
  const retryAnalysis = useAnalysisStore((s) => s.retryAnalysis);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [copied, setCopied] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  const isTerminal = status === "failed" || status === "completed";

  useEffect(() => {
    // Stop (and don't start) the timer once a terminal state is reached —
    // it should freeze at whatever it last showed, not keep counting.
    if (!createdAt || isTerminal) return;
    const start = new Date(createdAt).getTime();
    const tick = () => setElapsedMs(Date.now() - start);
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [createdAt, isTerminal]);

  const handleCopy = async () => {
    if (!analysisId) return;
    try {
      await navigator.clipboard.writeText(analysisId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable; ignore
    }
  };

  const handleRetry = async () => {
    setRetrying(true);
    setRetryError(null);
    try {
      await retryAnalysis();
    } catch (err) {
      setRetryError(err instanceof Error ? err.message : "Failed to retry analysis");
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6">
      <Card className="w-full max-w-lg">
        <CardContent className="flex flex-col items-center gap-8 py-8 text-center">
          {(status === "queued" || status === "running") && (
            // loader.svg animates itself via an embedded <style>/keyframes
            // block, so no animate-spin class is needed here.
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/loader.svg" alt="" className="size-16 drop-shadow-lg" />
          )}

          {status === "failed" && (
            <div className="flex flex-col items-center gap-3">
              <Button onClick={() => void handleRetry()} disabled={retrying}>
                {retrying ? "Retrying…" : "Retry Analysis"}
              </Button>
              {retryError && <p className="text-sm text-destructive">{retryError}</p>}
            </div>
          )}

          <div className="flex flex-col items-center gap-2">
            <p className="truncate text-base text-muted-foreground">{url}</p>
            {status && (
              <Badge className={cn("capitalize", status ? STATUS_BADGE[status] : undefined)}>
                {status}
              </Badge>
            )}
          </div>

          {progressStage && <p className="text-base text-foreground">{progressStage}</p>}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Elapsed {formatElapsed(elapsedMs)}</span>
          </div>

          {analysisId && (
            <button
              onClick={() => void handleCopy()}
              className="flex items-center gap-2 rounded-full bg-muted px-4 py-2.5 font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {analysisId}
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            </button>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
