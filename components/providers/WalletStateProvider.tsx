"use client";

import { useEffect, type ReactNode } from "react";
import type { WalletManager } from "@txnlab/use-wallet";

interface WalletStateProviderProps {
  manager: WalletManager;
  children: ReactNode;
}

/**
 * Kicks off session restoration for the current WalletManager. use-wallet
 * only attempts to reconnect previously-linked wallets (and flips
 * `isReady` to true) once `resumeSessions()` is called — it does not run
 * automatically. Remounting (new `manager`, e.g. on network switch) resumes
 * sessions again for the fresh manager instance.
 */
export function WalletStateProvider({ manager, children }: WalletStateProviderProps) {
  useEffect(() => {
    manager.resumeSessions().catch(() => {
      // Errors are already surfaced via manager's "error" event; a failed
      // reconnect just leaves the app in the disconnected state.
    });
  }, [manager]);

  return <>{children}</>;
}
