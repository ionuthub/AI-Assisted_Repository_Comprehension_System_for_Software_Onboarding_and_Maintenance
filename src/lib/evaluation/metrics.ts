/** Lightweight performance metrics used for indexing and Q&A timing. */
export interface MetricEntry {
  kind: "indexing" | "reindex" | "qa_response";
  ms: number;
  detail: string;
  at: string;
}

const KEY = "rcs_metrics_v1";

export function recordMetric(kind: MetricEntry["kind"], ms: number, detail: string): void {
  try {
    const entry: MetricEntry = { kind, ms: Math.round(ms), detail, at: new Date().toISOString() };
    const existing: MetricEntry[] = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    existing.push(entry);
    localStorage.setItem(KEY, JSON.stringify(existing.slice(-500)));
  } catch {
    /* metrics are best-effort */
  }
}
