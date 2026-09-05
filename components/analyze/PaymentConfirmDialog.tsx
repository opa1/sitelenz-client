"use client";

import { useWallet, useNetwork as useWalletNetworkConfig } from "@txnlab/use-wallet-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAnalysisStore } from "@/store/analysisStore";
import { useNetwork } from "@/context/NetworkContext";

const TIER_PRICE: Record<string, string> = {
  standard: "$1",
  deep: "$2",
};

export function PaymentConfirmDialog() {
  const pendingConfirmation = useAnalysisStore((s) => s.pendingConfirmation);
  const confirmAnalysis = useAnalysisStore((s) => s.confirmAnalysis);
  const cancelConfirmation = useAnalysisStore((s) => s.cancelConfirmation);
  const { activeAddress, signTransactions } = useWallet();
  const { activeNetworkConfig } = useWalletNetworkConfig();
  const { network } = useNetwork();

  if (!pendingConfirmation) return null;

  const price = TIER_PRICE[pendingConfirmation.tier] ?? "$1";

  const handleConfirm = () => {
    if (!activeAddress) return;
    // Fire and forget: the dialog closes immediately (confirmAnalysis clears
    // pendingConfirmation synchronously at the start), and progress from
    // here on shows on the Analyze button itself.
    void confirmAnalysis({
      activeAddress,
      signTransactions,
      network,
      algod: {
        baseServer: activeNetworkConfig.algod.baseServer,
        token:
          typeof activeNetworkConfig.algod.token === "string"
            ? activeNetworkConfig.algod.token
            : undefined,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Confirm payment</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base text-muted-foreground">
            Approve payment of <span className="font-medium text-foreground">{price} USDC</span>{" "}
            to SiteLenz to analyze{" "}
            <span className="break-all font-mono text-sm text-foreground">
              {pendingConfirmation.url}
            </span>
            .
          </p>
        </CardContent>
        <CardFooter className="gap-3">
          <Button variant="outline" size="lg" className="flex-1" onClick={cancelConfirmation}>
            Cancel
          </Button>
          <Button size="lg" className="flex-1" onClick={handleConfirm}>
            Confirm
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
