"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { DEFAULT_NETWORK } from "@/lib/env";
import type { Network } from "@/lib/types";

const STORAGE_KEY = "sitelenz_network";

interface NetworkContextValue {
  network: Network;
  setNetwork: (network: Network) => void;
}

const NetworkContext = createContext<NetworkContextValue | null>(null);

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [network, setNetworkState] = useState<Network>(DEFAULT_NETWORK);

  // Read the persisted preference after mount only, so server and first
  // client render agree (avoids a hydration mismatch).
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "testnet" || stored === "mainnet") {
        // One-time sync from localStorage (unavailable during SSR/first paint),
        // not derived state — there's no cascading update here.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setNetworkState(stored);
      }
    } catch {
      // localStorage unavailable; fall back to the env default
    }
  }, []);

  const setNetwork = (next: Network) => {
    setNetworkState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  };

  return (
    <NetworkContext.Provider value={{ network, setNetwork }}>{children}</NetworkContext.Provider>
  );
}

export function useNetwork(): NetworkContextValue {
  const ctx = useContext(NetworkContext);
  if (!ctx) {
    throw new Error("useNetwork must be used within a NetworkProvider");
  }
  return ctx;
}
