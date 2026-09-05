import { x402Client, x402HTTPClient } from "@x402/core/client";
import {
  ALGORAND_MAINNET_CAIP2,
  ALGORAND_MAINNET_GENESIS_HASH,
  ALGORAND_TESTNET_CAIP2,
  ALGORAND_TESTNET_GENESIS_HASH,
  ExactAvmScheme,
} from "@x402/avm";
import type { ClientAvmSigner } from "@x402/avm";
import type { PaymentRequired } from "@x402/fetch";
import { AlgorandClient } from "@algorandfoundation/algokit-utils";
import algosdk from "algosdk";
import type { Network } from "@/lib/types";

// algokit-utils' TransactionComposer defaults to a 10-round validity window
// (~30s on testnet). That's tight enough that a slow wallet approval (Pera/
// Defly over a WalletConnect relay + mobile app round trip) can push the
// broadcast past the transaction's lastValid round, producing "txn dead:
// round X outside of Y--Z". Widen it so the payment txn stays valid for the
// duration of a realistic (if slow) wallet interaction.
const PAYMENT_VALIDITY_WINDOW_ROUNDS = 1000;

export interface AlgorandPaymentSigner {
  address: string;
  signTransactions: (
    txnGroup: Uint8Array[],
    indexesToSign?: number[],
  ) => Promise<(Uint8Array | null)[]>;
}

export interface AlgodConnection {
  baseServer: string;
  token?: string;
}

function looksLikePaymentRequired(value: unknown): value is PaymentRequired {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as { accepts?: unknown }).accepts)
  );
}

/**
 * x402 settles the on-chain payment as part of accepting the paid retry
 * request — before the server's own business logic (creating the analysis)
 * runs. If that business logic then fails, the payment is already gone with
 * no analysisId ever returned to save to history. Surfacing the raw
 * Algorand transaction id(s) here means a failure after this point still
 * leaves the user something to look up on-chain or hand to support, instead
 * of a payment that just vanishes.
 */
function extractTransactionIds(paymentPayload: unknown): string[] {
  const group = (paymentPayload as { payload?: { paymentGroup?: unknown } })?.payload
    ?.paymentGroup;
  if (!Array.isArray(group)) return [];
  const ids: string[] = [];
  for (const entry of group) {
    if (typeof entry !== "string") continue;
    try {
      ids.push(algosdk.decodeSignedTransaction(Buffer.from(entry, "base64")).txn.txID());
    } catch {
      // not a decodable signed transaction; skip
    }
  }
  return ids;
}

/**
 * Equivalent to @x402/fetch's `wrapFetchWithPayment`, except the initial 402
 * body is parsed leniently.
 *
 * @x402/core's own `getPaymentRequiredResponse` only accepts a
 * body-embedded challenge when it declares `x402Version: 1` — a v2
 * challenge (`x402Version: 2`, which is what SiteLenz sends) is expected to
 * arrive via the `PAYMENT-REQUIRED` header instead, and the body is
 * otherwise rejected with "Invalid payment required response". SiteLenz's
 * API sends a structurally valid v2 challenge in the JSON body without that
 * header, so this accepts any well-formed body (any `x402Version`) rather
 * than rejecting it — everything after this initial parse (payload
 * creation, header encoding, settlement parsing) is unchanged from the
 * library's own implementation.
 */
function wrapFetchWithLenientPayment(
  fetchFn: typeof fetch,
  client: x402Client,
  onPaymentSubmitted?: (txnIds: string[]) => void,
): typeof fetch {
  const httpClient = new x402HTTPClient(client);

  return async (input, init) => {
    const request = new Request(input, init);
    const clonedRequest = request.clone();
    const response = await fetchFn(request);
    if (response.status !== 402) {
      return response;
    }

    let paymentRequired: PaymentRequired;
    try {
      const getHeader = (name: string) => response.headers.get(name);
      let body: unknown;
      try {
        const responseText = await response.text();
        if (responseText) body = JSON.parse(responseText);
      } catch {
        // no JSON body
      }

      if (getHeader("PAYMENT-REQUIRED")) {
        paymentRequired = httpClient.getPaymentRequiredResponse(getHeader);
      } else if (looksLikePaymentRequired(body)) {
        paymentRequired = body;
      } else {
        throw new Error("Invalid payment required response");
      }
    } catch (error) {
      throw new Error(
        `Failed to parse payment requirements: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }

    const requestUrl = response.url || request.url;
    const hookHeaders = await httpClient.handlePaymentRequired(paymentRequired, requestUrl);
    if (hookHeaders) {
      const hookRequest = clonedRequest.clone();
      for (const [key, value] of Object.entries(hookHeaders)) {
        hookRequest.headers.set(key, value);
      }
      const hookResponse = await fetchFn(hookRequest);
      if (hookResponse.status !== 402) {
        return hookResponse;
      }
    }

    let paymentPayload;
    try {
      paymentPayload = await client.createPaymentPayload(paymentRequired);
      onPaymentSubmitted?.(extractTransactionIds(paymentPayload));
    } catch (error) {
      throw new Error(
        `Failed to create payment payload: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }

    const paymentHeaders = httpClient.encodePaymentSignatureHeader(paymentPayload);
    if (clonedRequest.headers.has("PAYMENT-SIGNATURE") || clonedRequest.headers.has("X-PAYMENT")) {
      throw new Error("Payment already attempted");
    }
    for (const [key, value] of Object.entries(paymentHeaders)) {
      clonedRequest.headers.set(key, value);
    }
    // Deliberately not setting Access-Control-Expose-Headers here: that's a
    // response-only header per the CORS spec, so setting it on the request
    // does nothing useful — but it still counts as "a header we're sending"
    // for the browser's preflight check. SiteLenz's CORS preflight returns
    // an explicit Access-Control-Allow-Headers allowlist (no wildcard) that
    // doesn't include it, so including this line silently blocked every
    // retry client-side, before it ever reached the network: the server
    // only ever saw the first, unpaid request.

    const secondResponse = await fetchFn(clonedRequest.clone());
    const result = await httpClient.processPaymentResult(
      paymentPayload,
      (name) => secondResponse.headers.get(name),
      secondResponse.status,
    );

    if (result.recovered) {
      const freshPayload = await client.createPaymentPayload(paymentRequired);
      onPaymentSubmitted?.(extractTransactionIds(freshPayload));
      const retryHeaders = httpClient.encodePaymentSignatureHeader(freshPayload);
      const retryRequest = clonedRequest;
      for (const [key, value] of Object.entries(retryHeaders)) {
        retryRequest.headers.set(key, value);
      }
      const retryResponse = await fetchFn(retryRequest);
      await httpClient.processPaymentResult(
        freshPayload,
        (name) => retryResponse.headers.get(name),
        retryResponse.status,
      );
      return retryResponse;
    }

    return secondResponse;
  };
}

/**
 * Builds a fetch function that transparently pays x402 402 challenges using
 * an Algorand wallet (via @x402/avm's "exact" ASA-transfer scheme).
 */
export function createPaymentFetch(
  network: Network,
  algod: AlgodConnection,
  wallet: AlgorandPaymentSigner,
  onPaymentSubmitted?: (txnIds: string[]) => void,
): typeof fetch {
  const signer: ClientAvmSigner = {
    address: wallet.address,
    signTransactions: (txns, indexesToSign) => wallet.signTransactions(txns, indexesToSign),
  };

  const algorandClient = AlgorandClient.fromConfig({
    algodConfig: { server: algod.baseServer, token: algod.token ?? "" },
  }).setDefaultValidityWindow(PAYMENT_VALIDITY_WINDOW_ROUNDS);

  const scheme = new ExactAvmScheme(signer, { algorandClient });

  // SiteLenz's facilitator sends (and expects the outgoing payment payload
  // to echo back byte-for-byte) the Algorand network id as the full
  // standard-base64 genesis hash, e.g. `algorand:SGO1...xi9/cOUJOiI=` — not
  // the CAIP-2-compliant, url-safe, 32-char-truncated form `@x402/avm`'s own
  // constants use (CAIP-2 chain references only allow `[-a-zA-Z0-9]{1,32}`).
  // Register the scheme under both forms so x402Client's exact-match lookup
  // succeeds either way, rather than normalizing (and thereby mutating) the
  // requirement — mutating it would change what we echo back, and the
  // facilitator matches that against what it originally sent.
  const canonicalNetwork = network === "mainnet" ? ALGORAND_MAINNET_CAIP2 : ALGORAND_TESTNET_CAIP2;
  const fullHashNetwork: `${string}:${string}` = `algorand:${
    network === "mainnet" ? ALGORAND_MAINNET_GENESIS_HASH : ALGORAND_TESTNET_GENESIS_HASH
  }`;

  const client = new x402Client()
    .register(canonicalNetwork, scheme)
    .register(fullHashNetwork, scheme)
    // @x402/core defaults spendControls.maxAmountPerPayment to $1, which
    // silently rejects every payment requirement above that — including our
    // own Deep tier ($2). Raise it to cover our known tiers with headroom,
    // rather than disabling the guard rail entirely.
    .setSpendControls({ maxAmountPerPayment: 5 });

  return wrapFetchWithLenientPayment(fetch, client, onPaymentSubmitted);
}

/** Heuristic classification of a payment failure for user-facing messaging. */
export function describePaymentError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (/reject|cancel|denied|declin/i.test(message)) {
    return "Payment cancelled";
  }
  return message || "Payment failed";
}
