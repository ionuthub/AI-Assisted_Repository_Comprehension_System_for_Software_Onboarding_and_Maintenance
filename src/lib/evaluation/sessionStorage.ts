import type { Condition, StudyTask, TlxRatings } from "@/lib/evaluation/session";

/**
 * Every field of an in-progress session that must survive a page reload.
 *
 * Session state lived only in component state, so a refresh, a back-button press or a
 * render error discarded a participant's timings, answers, confidence ratings and
 * questionnaires with no way to recover them. Participant time is the one resource a study
 * cannot regenerate, so the cost of losing a session is an entire re-run or an exclusion.
 */
export interface PersistedSession {
  version: 1;
  savedAtIso: string;
  phase: string;
  participantId: string;
  condition: Condition;
  order: "manual-first" | "tool-first";
  repository: string;
  tasks: StudyTask[];
  activeTaskId: number | null;
  // No retention fields: retention is a task with `kind: "retention"`, so its answer, timing and
  // confidence persist inside `tasks` like any other task's. Sessions written before the
  // retention phase was removed carry two extra keys here; they are ignored rather than migrated,
  // and Evaluation.tsx resumes an unrecognised `phase` at setup.
  tlx: TlxRatings;
  // Null entries, and absent entries, both mean "not answered". tsconfig sets
  // strictNullChecks: false, so this annotation documents the contract rather than enforcing it —
  // the enforcement is in session.test.ts, which asserts that an incomplete instrument scores null
  // rather than being completed with a default.
  sus: Record<number, number | null>;
  notes: string;
}

const KEY = "rcs_evaluation_session_v1";

/** Saves are best-effort: a storage failure must never interrupt a running session. */
export function saveSession(session: Omit<PersistedSession, "version" | "savedAtIso">): void {
  try {
    const payload: PersistedSession = { ...session, version: 1, savedAtIso: new Date().toISOString() };
    localStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    // Quota exceeded or storage unavailable; the session continues in memory.
  }
}

export function loadSession(): PersistedSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedSession;
    // A payload written by a different shape is discarded rather than partially applied,
    // which would produce a session that looks resumable but has missing fields.
    if (parsed?.version !== 1 || !Array.isArray(parsed.tasks)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing to do; the next save overwrites it.
  }
}

/** True when the stored session holds work worth offering to restore. */
export function hasResumableWork(session: PersistedSession | null): boolean {
  if (!session) return false;
  if (session.phase !== "setup") return true;
  return session.tasks.some((task) => task.status !== "idle" || task.answer.trim().length > 0);
}
