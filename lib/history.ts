import type { HistoryEntry } from "@/lib/types";

const HISTORY_KEY = "sitelenz_history";
const MAX_HISTORY = 10;

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveHistoryEntry(entry: HistoryEntry): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  const existing = getHistory().filter((item) => item.analysisId !== entry.analysisId);
  const next = [entry, ...existing].slice(0, MAX_HISTORY);
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // storage full or unavailable; history is a convenience, not critical
  }
  return next;
}

export function updateHistoryEntry(
  analysisId: string,
  patch: Partial<HistoryEntry>,
): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  const existing = getHistory();
  const next = existing.map((item) =>
    item.analysisId === analysisId ? { ...item, ...patch } : item,
  );
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  return next;
}
