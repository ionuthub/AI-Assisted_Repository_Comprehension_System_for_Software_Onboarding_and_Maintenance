/**
 * Pilot metrics instrumentation.
 *
 * Records the two system-performance measures the study reports:
 *  - indexing duration (ms) whenever the TF-IDF search index is built
 *  - QA response time (ms) for each grounded question round-trip
 *
 * Entries persist in localStorage so the Evaluation page can export them
 * with the session. Storage failures are swallowed: metrics must never
 * break the application.
 */

export interface MetricEntry {
  // "indexing" is the one-off build for a newly loaded repository; "reindex" is the
  // incidental rebuild triggered by opening a file. Kept distinct so analysis grouping
  // by kind does not average hundreds of reindexes into the cold-start figure.
  kind: "indexing" | "reindex" | "qa_response";
  ms: number;
  detail: string; // e.g. file count for indexing, question length for QA
  at: string; // ISO timestamp
}

const KEY = "rcs_pilot_metrics_v1";

export function recordMetric(kind: MetricEntry["kind"], ms: number, detail: string): void {
  try {
    const entry: MetricEntry = { kind, ms: Math.round(ms), detail, at: new Date().toISOString() };
    const existing: MetricEntry[] = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    existing.push(entry);
    // Keep the log bounded; the pilot needs recent sessions, not history forever.
    localStorage.setItem(KEY, JSON.stringify(existing.slice(-500)));
  } catch {
    /* metrics are best-effort */
  }
}

export function readMetrics(): MetricEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function clearMetrics(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
