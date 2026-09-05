"use client";

import { useState } from "react";
import { ChevronDown, Wallet as WalletIcon } from "lucide-react";
import { useWallet } from "@txnlab/use-wallet-react";
import { Header } from "@/components/layout/Header";
import { BrandMark } from "@/components/layout/BrandMark";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DisconnectedState() {
  const { availableWallets } = useWallet();
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const handleConnect = async (walletId: string) => {
    const wallet = availableWallets.find((w) => w.id === walletId);
    if (!wallet) return;
    setConnectingId(walletId);
    try {
      await wallet.connect();
    } finally {
      setConnectingId(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header connected={false} />
      <main className="flex flex-1 flex-col items-center justify-center gap-10 px-8 text-center">
        <BrandMark size={144} />
        <div className="flex flex-col items-center gap-3">
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-shadow-lg">
            SiteLenz
          </h1>
          <p className="text-lg text-muted-foreground">Website Intelligence API</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button size="lg" className="h-14 gap-2.5 px-8 text-base" disabled={connectingId !== null}>
                <WalletIcon />
                {connectingId ? "Connecting…" : "Connect Wallet"}
                <ChevronDown className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="center" className="min-w-56 p-2">
            {availableWallets.map((wallet) => (
              <DropdownMenuItem
                key={wallet.id}
                onClick={() => void handleConnect(wallet.id)}
                className="py-3 text-base"
              >
                {wallet.metadata.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </main>
    </div>
  );
}
