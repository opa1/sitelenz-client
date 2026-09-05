"use client";

import { useWallet } from "@txnlab/use-wallet-react";
import { LoadingState } from "@/components/states/LoadingState";
import { DisconnectedState } from "@/components/states/DisconnectedState";
import { AppLayout } from "@/components/layout/AppLayout";

export default function Home() {
  const { isReady, activeAddress } = useWallet();

  if (!isReady) {
    return <LoadingState />;
  }

  if (!activeAddress) {
    return <DisconnectedState />;
  }

  return <AppLayout />;
}
