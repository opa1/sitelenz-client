"use client";

import { useCallback } from "react";
import { useWallet } from "@txnlab/use-wallet-react";
import { useNetwork } from "@/context/NetworkContext";
import type { Network } from "@/lib/types";

/**
 * Switches the app's active network, disconnecting the wallet first if one
 * is connected.
 *
 * A WalletConnect session's chain id (testnet vs mainnet) is negotiated
 * once, at `connect()` time, and can't be changed by reconnecting — so
 * simply swapping which chain id we *pass* to the wallet adapter on a
 * network switch doesn't touch the wallet's already-live session. Without
 * disconnecting first, the app and the wallet would silently disagree on
 * which network they're operating on (same failure mode as an unset
 * chainId defaulting to mainnet). A network switch always needs a fresh
 * connection on the new network.
 */
export function useSwitchNetwork() {
  const { activeWallet } = useWallet();
  const { network, setNetwork } = useNetwork();

  const switchNetwork = useCallback(
    async (next: Network) => {
      if (next === network) return;
      if (activeWallet) {
        await activeWallet.disconnect();
      }
      setNetwork(next);
    },
    [network, setNetwork, activeWallet],
  );

  return { network, switchNetwork };
}
