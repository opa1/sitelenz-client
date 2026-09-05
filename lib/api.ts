import { apiUrl } from "@/lib/env";
import type { AnalysisReportData, AnalysisStatusResponse } from "@/lib/types";

// Render's free tier can cold-start a sleeping instance in 30-60s, but
// without any timeout a stalled connection just hangs the UI forever (no
// error, no way to retry) — bound every request so a dead server surfaces
// as a real, retryable error instead of an infinite spinner.
const REQUEST_TIMEOUT_MS = 60_000;

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, { ...init, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  } catch (err) {
    if (err instanceof DOMException && err.name === "TimeoutError") {
      throw new Error(`Request timed out after ${REQUEST_TIMEOUT_MS / 1000}s: ${url}`);
    }
    throw err;
  }
}

export async function fetchAnalysisStatus(analysisId: string): Promise<AnalysisStatusResponse> {
  const res = await fetchWithTimeout(apiUrl(`/v1/analyses/${analysisId}`));
  if (!res.ok) {
    throw new Error(`Failed to fetch analysis status (${res.status})`);
  }
  return res.json();
}

export async function fetchAnalysisReport(analysisId: string): Promise<AnalysisReportData> {
  const res = await fetchWithTimeout(apiUrl(`/v1/analyses/${analysisId}/report`));
  if (!res.ok) {
    throw new Error(`Failed to fetch analysis report (${res.status})`);
  }
  return res.json();
}

/** Retries a failed analysis. Plain POST — no payment, no x402 interceptor. */
export async function retryAnalysis(analysisId: string): Promise<{ retried: boolean }> {
  const res = await fetchWithTimeout(apiUrl(`/v1/analyses/${analysisId}/retry`), {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error(`Failed to retry analysis (${res.status})`);
  }
  return res.json();
}
