"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Info, Loader2 } from "lucide-react";
import { BrandMark } from "@/components/layout/BrandMark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsIndicator, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAnalysisStore } from "@/store/analysisStore";
import { PAYMENT_STAGE_LABEL } from "@/lib/paymentStage";
import type { AnalysisTier } from "@/lib/types";

// How long we wait in the wallet-facing stages before assuming the wallet
// might not be responding and nudging the user to check their device.
const WALLET_REMINDER_DELAY_MS = 6000;

function resolveWebhookUrl(): string | undefined {
  if (typeof window === "undefined") return undefined;
  if (window.location.protocol === "https:") {
    return window.location.href;
  }
  return undefined;
}

export function AnalyzeForm() {
  const requestAnalysis = useAnalysisStore((s) => s.requestAnalysis);
  const submitting = useAnalysisStore((s) => s.submitting);
  const paymentStage = useAnalysisStore((s) => s.paymentStage);
  const error = useAnalysisStore((s) => s.error);
  const [url, setUrl] = useState("");
  const [tier, setTier] = useState<AnalysisTier>("standard");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showWalletReminder, setShowWalletReminder] = useState(false);

  const waitingOnWallet = paymentStage === "connecting" || paymentStage === "confirming";

  useEffect(() => {
    if (!waitingOnWallet) {
      // Resets a timer-driven flag when we leave the wallet-waiting stages;
      // not state derived from props/state, so no cascade risk.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowWalletReminder(false);
      return;
    }
    const timer = setTimeout(() => setShowWalletReminder(true), WALLET_REMINDER_DELAY_MS);
    return () => clearTimeout(timer);
  }, [waitingOnWallet]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = url.trim();
    const normalized = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    if (!/^https?:\/\/.+/i.test(normalized)) {
      setValidationError("Enter a valid URL");
      return;
    }
    setValidationError(null);
    requestAnalysis(normalized, tier, resolveWebhookUrl());
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8">
      <div className="flex w-full max-w-xl flex-col items-center gap-10">
        <BrandMark size={90} />

        <Tabs
          value={tier}
          onValueChange={(value) => setTier(value as AnalysisTier)}
        >
          <TabsList>
            <TabsIndicator />
            <TabsTrigger
              value="standard"
              className="z-10 border-transparent! bg-transparent! transition-colors duration-[400ms] ease-[cubic-bezier(0.65,0,0.35,1)] data-active:bg-transparent! dark:data-active:bg-transparent!"
            >
              Standard
            </TabsTrigger>
            <TabsTrigger
              value="deep"
              className="z-10 border-transparent! bg-transparent! transition-colors duration-[400ms] ease-[cubic-bezier(0.65,0,0.35,1)] data-active:bg-transparent! dark:data-active:bg-transparent!"
            >
              Deep
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
          <Input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="example.com"
            className="h-16 text-center text-lg"
            inputMode="url"
            autoComplete="off"
            disabled={submitting}
          />
          {validationError && (
            <p className="text-center text-sm text-destructive">
              {validationError}
            </p>
          )}
          <Button
            type="submit"
            size="lg"
            className="h-14 text-base"
            disabled={submitting || url.trim().length === 0}
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" />
                {paymentStage ? PAYMENT_STAGE_LABEL[paymentStage] : "Submitting"}…
              </>
            ) : (
              <>
                Analyze
                <ArrowRight />
              </>
            )}
          </Button>

          {showWalletReminder && (
            <div className="flex items-start gap-2.5 rounded-2xl bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
              <Info className="size-4 shrink-0 translate-y-0.5" />
              Still waiting on your wallet. Make sure your device is unlocked and connected, then
              check for a signing request there.
            </div>
          )}

          {!submitting && error && (
            <p className="text-center text-sm text-destructive">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
}
