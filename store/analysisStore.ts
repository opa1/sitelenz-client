import { create } from "zustand";
import { apiUrl } from "@/lib/env";
import {
  fetchAnalysisReport,
  fetchAnalysisStatus,
  retryAnalysis as retryAnalysisRequest,
} from "@/lib/api";
import { createPaymentFetch, describePaymentError } from "@/lib/x402/paymentClient";
import { saveHistoryEntry, updateHistoryEntry } from "@/lib/history";
import type { PaymentStage } from "@/lib/paymentStage";
import type {
  AnalysisReportData,
  AnalysisStatusValue,
  AnalysisSubmitResponse,
  AnalysisTier,
  HistoryEntry,
  Network,
} from "@/lib/types";

const POLL_INTERVAL_MS = 10_000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;

export type AnalysisView = "idle" | "submitted" | "completed";

export interface PendingConfirmation {
  url: string;
  tier: AnalysisTier;
  webhookUrl?: string;
}

/** Wallet/network context gathered by the caller (a component, via hooks) at confirm time. */
export interface ConfirmAnalysisDeps {
  activeAddress: string;
  signTransactions: (
    txnGroup: Uint8Array[],
    indexesToSign?: number[],
  ) => Promise<(Uint8Array | null)[]>;
  network: Network;
  algod: { baseServer: string; token?: string };
}

interface AnalysisState {
  view: AnalysisView;
  analysisId: string | null;
  url: string | null;
  tier: AnalysisTier | null;
  status: AnalysisStatusValue | null;
  progressStage: string | null;
  createdAt: string | null;
  completedAt: string | null;
  report: AnalysisReportData | null;
  reportLoading: boolean;
  error: string | null;
  submitting: boolean;
  paymentStage: PaymentStage | null;
  pendingConfirmation: PendingConfirmation | null;
}

interface AnalysisActions {
  requestAnalysis: (url: string, tier: AnalysisTier, webhookUrl?: string) => void;
  cancelConfirmation: () => void;
  confirmAnalysis: (deps: ConfirmAnalysisDeps) => Promise<void>;
  loadFromHistory: (entry: HistoryEntry) => void;
  /** Retries a failed analysis (no payment). Throws on failure so the
   * caller (AnalysisStatus) can show an inline retry error. */
  retryAnalysis: () => Promise<void>;
  reset: () => void;
}

const initialState: AnalysisState = {
  view: "idle",
  analysisId: null,
  url: null,
  tier: null,
  status: null,
  progressStage: null,
  createdAt: null,
  completedAt: null,
  report: null,
  reportLoading: false,
  error: null,
  submitting: false,
  paymentStage: null,
  pendingConfirmation: null,
};

// Polling isn't reactive UI state, so it lives outside the store as plain
// module state rather than triggering re-renders on every tick.
let pollTimer: ReturnType<typeof setInterval> | null = null;
let pollDeadline = 0;

function clearPolling() {
  if (pollTimer !== null) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

/**
 * The API's error field isn't guaranteed to be a plain string — it's been
 * observed as a structured `{code, message}` object too — and TypeScript's
 * `res.json()` typing doesn't actually validate the runtime shape. Rendering
 * an object directly as a JSX child crashes React, so always resolve to a
 * string before it reaches state.
 */
function extractErrorMessage(value: unknown, fallback: string): string {
  if (typeof value === "string" && value) return value;
  if (value && typeof value === "object") {
    const message = (value as { message?: unknown }).message;
    if (typeof message === "string" && message) return message;
  }
  return fallback;
}

export const useAnalysisStore = create<AnalysisState & AnalysisActions>((set, get) => {
  async function loadReport(analysisId: string) {
    set({ reportLoading: true, error: null });
    try {
      const report = await fetchAnalysisReport(analysisId);
      set({ report, reportLoading: false });
      updateHistoryEntry(analysisId, { report });
    } catch (err) {
      console.error(
        `[report] failed to load ${analysisId} at ${new Date().toISOString()}:`,
        err,
      );
      set({
        reportLoading: false,
        error: err instanceof Error ? err.message : "Failed to load report",
      });
    }
  }

  function finishWithCompletion(analysisId: string) {
    const completedAt = new Date().toISOString();
    set({ view: "completed", status: "completed", completedAt });
    updateHistoryEntry(analysisId, { status: "completed", completedAt });
    void loadReport(analysisId);
  }

  function startPolling(analysisId: string) {
    clearPolling();
    pollDeadline = Date.now() + POLL_TIMEOUT_MS;

    const tick = async () => {
      if (Date.now() > pollDeadline) {
        clearPolling();
        set({ error: "Analysis timed out after 5 minutes" });
        return;
      }
      try {
        const result = await fetchAnalysisStatus(analysisId);
        set({ status: result.status, progressStage: result.progressStage ?? get().progressStage });
        updateHistoryEntry(analysisId, { status: result.status });

        if (result.status === "completed") {
          clearPolling();
          finishWithCompletion(analysisId);
        } else if (result.status === "failed") {
          clearPolling();
          set({ error: extractErrorMessage(result.error, "Analysis failed") });
        }
      } catch {
        // transient network error; keep polling until the timeout
      }
    };

    void tick();
    pollTimer = setInterval(() => void tick(), POLL_INTERVAL_MS);
  }

  return {
    ...initialState,

    requestAnalysis: (url, tier, webhookUrl) => {
      set({ pendingConfirmation: { url, tier, webhookUrl }, error: null });
    },

    cancelConfirmation: () => {
      set({ pendingConfirmation: null, paymentStage: null, submitting: false, error: null });
    },

    confirmAnalysis: async (deps) => {
      const pending = get().pendingConfirmation;
      if (!pending) return;

      // Close the dialog immediately; progress now shows on the Analyze
      // button itself (disabled, cycling through payment stages).
      set({
        submitting: true,
        error: null,
        paymentStage: "preparing",
        pendingConfirmation: null,
      });

      // x402 settles the on-chain payment as part of accepting the retried
      // request, before the server creates the analysis — so a failure past
      // that point still costs money with no analysisId to show for it.
      // Captured as soon as the payment is signed so it can be surfaced in
      // the error message no matter where things go wrong afterward.
      let paymentTxnIds: string[] = [];
      const appendTxnIds = (message: string) =>
        paymentTxnIds.length > 0
          ? `${message} (payment txn: ${paymentTxnIds.join(", ")} — the payment may have gone through even though this failed; save this id)`
          : message;

      try {
        // Wrapped so the UI knows exactly when we're waiting on the wallet
        // (vs. building the request or waiting on the server).
        const instrumentedSign = async (txns: Uint8Array[], indexesToSign?: number[]) => {
          set({ paymentStage: "confirming" });
          try {
            return await deps.signTransactions(txns, indexesToSign);
          } finally {
            set({ paymentStage: "analysing" });
          }
        };

        const paymentFetch = createPaymentFetch(
          deps.network,
          deps.algod,
          { address: deps.activeAddress, signTransactions: instrumentedSign },
          (txnIds) => {
            paymentTxnIds = txnIds;
          },
        );

        set({ paymentStage: "connecting" });

        const res = await paymentFetch(apiUrl("/v1/analyses"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: pending.url,
            analysis: pending.tier,
            ...(pending.webhookUrl ? { webhookUrl: pending.webhookUrl } : {}),
          }),
        });

        if (!res.ok) {
          let message = `Request failed (${res.status})`;
          try {
            const data = await res.json();
            if (data?.error) message = extractErrorMessage(data.error, message);
          } catch {
            // no JSON body
          }
          console.error(
            `[x402] analysis request failed after payment at ${new Date().toISOString()}:`,
            { url: pending.url, tier: pending.tier, status: res.status, message, paymentTxnIds },
          );
          set({ submitting: false, paymentStage: null, error: appendTxnIds(message) });
          return;
        }

        set({ paymentStage: "finishing" });

        const data: AnalysisSubmitResponse = await res.json();
        const createdAt = new Date().toISOString();

        const entry: HistoryEntry = {
          analysisId: data.analysisId,
          url: pending.url,
          tier: pending.tier,
          status: data.status,
          createdAt,
        };
        saveHistoryEntry(entry);

        set({
          submitting: false,
          paymentStage: null,
          view: "submitted",
          analysisId: data.analysisId,
          url: pending.url,
          tier: pending.tier,
          status: data.status,
          progressStage: null,
          createdAt,
          completedAt: null,
          report: null,
        });

        if (data.status === "completed") {
          finishWithCompletion(data.analysisId);
        } else {
          startPolling(data.analysisId);
        }
      } catch (err) {
        // The "Payment cancelled" bucket below is a lossy heuristic (Pera/Defly
        // report several unrelated wallet-side failures, e.g. insufficient
        // balance, under the same "cancelled"/"rejected" wording as an actual
        // user decline) — log the full error so devtools shows what actually
        // happened, not just the bucketed message.
        console.error(
          `[x402] payment failed at ${new Date().toISOString()} — url=${pending.url} tier=${pending.tier}`,
          {
            name: err instanceof Error ? err.name : typeof err,
            message: err instanceof Error ? err.message : String(err),
            // Pera/Defly attach structured info here, e.g. { type: "SIGN_TXN_CANCELLED" }
            data: (err as { data?: unknown })?.data,
            cause: err instanceof Error ? err.cause : undefined,
            stack: err instanceof Error ? err.stack : undefined,
            paymentTxnIds,
            raw: err,
          },
        );
        set({
          submitting: false,
          paymentStage: null,
          error: appendTxnIds(describePaymentError(err)),
        });
      }
    },

    loadFromHistory: (entry) => {
      clearPolling();
      set({
        view: entry.status === "completed" ? "completed" : "submitted",
        analysisId: entry.analysisId,
        url: entry.url,
        tier: entry.tier,
        status: entry.status,
        progressStage: null,
        createdAt: entry.createdAt,
        completedAt: entry.completedAt ?? null,
        report: entry.report ?? null,
        reportLoading: false,
        error: null,
        pendingConfirmation: null,
      });

      if (entry.status === "completed") {
        // Cached from a previous fetch — avoid re-hitting the server for
        // something that's already sitting in localStorage.
        if (!entry.report) {
          void loadReport(entry.analysisId);
        }
      } else {
        startPolling(entry.analysisId);
      }
    },

    retryAnalysis: async () => {
      const id = get().analysisId;
      if (!id) {
        throw new Error("No analysis to retry");
      }
      const result = await retryAnalysisRequest(id);
      if (!result?.retried) {
        throw new Error("Retry was not accepted");
      }
      const createdAt = new Date().toISOString();
      set({ status: "queued", createdAt, progressStage: null, error: null });
      updateHistoryEntry(id, { status: "queued" });
      startPolling(id);
    },

    reset: () => {
      clearPolling();
      set(initialState);
    },
  };
});
