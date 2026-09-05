"use client";

import { useMemo, type ReactNode } from "react";
import { WalletManager } from "@txnlab/use-wallet";
import { WalletProvider } from "@txnlab/use-wallet-react";
import { pera } from "@txnlab/use-wallet-pera";
import { defly } from "@txnlab/use-wallet-defly";
import { useNetwork } from "@/context/NetworkContext";
import { WalletStateProvider } from "@/components/providers/WalletStateProvider";
import type { Network } from "@/lib/types";

// WalletConnect v1's own network id for the session (distinct from algod's
// genesis hash / our app network). Pera's SDK treats an *unset* chainId as
// mainnet (its `getNetworkFromChainId` maps the generic default 4160 to
// "mainnet"), so a session created without this pointed the wallet at
// mainnet even while we were on testnet — the wallet then had nothing
// sensible to show for a testnet signing request. Defly uses the same ids.
const WALLET_CONNECT_CHAIN_ID: Record<Network, 416001 | 416002> = {
  mainnet: 416001,
  testnet: 416002,
};

/**
 * Owns the WalletManager instance and keys it (and the WalletProvider
 * subtree) on the active network, so switching networks tears down and
 * rebuilds wallet state against the new network's algod config.
 */
export function WalletProviders({ children }: { children: ReactNode }) {
  const { network } = useNetwork();

  const manager = useMemo(() => {
    const chainId = WALLET_CONNECT_CHAIN_ID[network];
    return new WalletManager({
      wallets: [pera({ chainId }), defly({ chainId })],
      defaultNetwork: network,
      options: { persistNetwork: false },
    });
  }, [network]);

  return (
    <WalletProvider manager={manager} key={network}>
      <WalletStateProvider manager={manager}>{children}</WalletStateProvider>
    </WalletProvider>
  );
}
