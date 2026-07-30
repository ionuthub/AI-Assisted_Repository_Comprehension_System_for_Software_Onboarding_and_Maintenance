/**
 * Study session model for the controlled evaluation.
 *
 * Encodes the AE1 methodology directly:
 *  - two task kinds (locating, applied) plus a no-tool retention question
 *  - within-subjects condition (manual vs tool) with recorded order
 *  - per-task confidence (for the confidence-accuracy gap)
 *  - seeded-inaccurate tasks (over-trust probes, Buçinca et al. 2021)
 *  - NASA-TLX (six subscales) and SUS (Brooke 1996) with standard scoring
 *  - ground-truth import and CSV/JSON export for analysis
 */

export type Condition = "manual" | "tool";
export type TaskKind = "locating" | "applied" | "retention";

export interface StudyTask {
  id: number;
  kind: TaskKind;
  name: string;
  description: string;
  expectedFiles: string[];
  answerKey: string;
  /** Over-trust probe: the tool's answer to this task is known to be wrong. */
  seededInaccurate?: boolean;
  /** The incorrect answer the tool gives, recorded so detection can be scored. */
  seededAnswerShown?: string;
  // runtime capture
  status: "idle" | "running" | "completed";
  startTimeIso: string | null;
  completionTimeIso: string | null;
  elapsedSeconds: number;
  answer: string;
  confidence: number; // 1-5, captured after each task
  isCorrect: boolean | null; // scored against the answer key by the experimenter
  /** For seeded tasks: did the participant flag the tool's answer as wrong? */
  errorDetected: boolean | null;
}

export interface TlxRatings {
  mental: number;
  physical: number;
  temporal: number;
  performance: number;
  effort: number;
  frustration: number;
}

export const TLX_SCALES: { key: keyof TlxRatings; label: string; prompt: string }[] = [
  { key: "mental", label: "Mental demand", prompt: "How mentally demanding were the tasks?" },
  { key: "physical", label: "Physical demand", prompt: "How physically demanding were the tasks?" },
  { key: "temporal", label: "Temporal demand", prompt: "How hurried or rushed was the pace?" },
  { key: "performance", label: "Performance", prompt: "How successful were you in accomplishing the tasks? (0 = perfect, 100 = failure)" },
  { key: "effort", label: "Effort", prompt: "How hard did you have to work to accomplish your level of performance?" },
  { key: "frustration", label: "Frustration", prompt: "How insecure, discouraged, irritated, stressed or annoyed were you?" },
];

export interface StudySession {
  participantId: string;
  condition: Condition;
  conditionOrder: "manual-first" | "tool-first";
  repository: string;
  startedAtIso: string;
  tasks: StudyTask[];
  tlx: TlxRatings;
  sus: Record<number, number>; // question index (0-9) -> 1..5
  notes: string;
}

/** Raw NASA-TLX (unweighted mean of the six subscales, 0-100). */
export function tlxScore(t: TlxRatings): number {
  const vals = [t.mental, t.physical, t.temporal, t.performance, t.effort, t.frustration];
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
}

/** Standard SUS scoring (Brooke 1996): odd items score r-1, even items 5-r, sum * 2.5. */
export function susScore(ratings: Record<number, number>): number {
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    const r = ratings[i] ?? 3;
    sum += i % 2 === 0 ? r - 1 : 5 - r;
  }
  return Math.round(sum * 2.5 * 10) / 10;
}

/** Ground-truth answer key format accepted by the import control. */
export interface GroundTruthFile {
  repository?: string;
  tasks: {
    id: number;
    kind: TaskKind;
    name: string;
    description: string;
    expectedFiles?: string[];
    answerKey: string;
    seededInaccurate?: boolean;
    seededAnswerShown?: string;
  }[];
}

/**
 * Built-in demonstration task set, loaded so the runner can be walked through before a
 * study session begins. Its answer keys are placeholders, so a session run on it exports
 * in exactly the shape of real data while scoring answers against nothing.
 */
export const DEMO_ANSWER_KEY: GroundTruthFile = {
  repository: "demo",
  tasks: [
    { id: 1, kind: "locating", name: "Locate the routing structure", description: "Find the file defining the application's navigation paths.", expectedFiles: ["src/App.tsx"], answerKey: "Routing is declared in src/App.tsx." },
    { id: 2, kind: "locating", name: "Locate authentication handling", description: "Find where session validation or login is handled.", expectedFiles: ["src/hooks/useGitHubAuth.ts"], answerKey: "Authentication is handled in src/hooks/useGitHubAuth.ts." },
    { id: 3, kind: "applied", name: "Plan a change", description: "Where would a new user-profile feature be added, and what else would need to change? Explain your reasoning.", expectedFiles: [], answerKey: "Marked against the rubric: correct insertion point plus at least two affected areas." },
  ],
};

/** Identity of a task set by what it asks and what it marks against, ignoring runtime capture. */
function taskSetSignature(tasks: readonly { name: string; answerKey: string }[]): string {
  return tasks.map((t) => `${t.name} :: ${t.answerKey}`).join("\n");
}

/** True while the loaded tasks are still the built-in demonstration set. */
export function isDemoTaskSet(tasks: readonly { name: string; answerKey: string }[]): boolean {
  return taskSetSignature(tasks) === taskSetSignature(DEMO_ANSWER_KEY.tasks);
}

/**
 * Whether the setup phase may hand over to the task phase.
 *
 * Requires both an identifier to file the export under and a real answer key in place of
 * the demo set: a session begun on the demo tasks yields an export a later analysis cannot
 * distinguish from a genuine run, with every answer scored against a placeholder key.
 */
export function canBeginTasks(
  participantId: string,
  tasks: readonly { name: string; answerKey: string }[]
): boolean {
  return participantId.trim().length > 0 && tasks.length > 0 && !isDemoTaskSet(tasks);
}

export function tasksFromGroundTruth(gt: GroundTruthFile): StudyTask[] {
  return gt.tasks.map((t) => ({
    id: t.id,
    kind: t.kind,
    name: t.name,
    description: t.description,
    expectedFiles: t.expectedFiles ?? [],
    answerKey: t.answerKey,
    seededInaccurate: t.seededInaccurate ?? false,
    seededAnswerShown: t.seededAnswerShown,
    status: "idle",
    startTimeIso: null,
    completionTimeIso: null,
    elapsedSeconds: 0,
    answer: "",
    confidence: 3,
    isCorrect: null,
    // null means "not administered". Defaulting seeded tasks to false would export an
    // unasked probe as a genuine failure to detect, biasing the over-trust measure —
    // the probe UI is only shown in the tool condition.
    errorDetected: null,
  }));
}

// Leading =, +, -, @, tab or CR make a spreadsheet treat a cell as a formula, so a
// participant answer beginning with one would be displayed as #NAME? rather than the
// text they gave. The apostrophe forces text; strip it when loading the data.
const FORMULA_TRIGGER = /^[=+\-@\t\r]/;

function csvEscape(v: unknown): string {
  let s = String(v ?? "");
  if (FORMULA_TRIGGER.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Tidy format: one row per task, with the session-level scores repeated on each row.
// The previous implementation appended a summary row that placed the TLX score in the
// elapsedSeconds column and the SUS score in seededInaccurate, so any dataframe load
// silently mixed a workload score into the task durations.
export function sessionToCsv(s: StudySession): string {
  const susTotal = susScore(s.sus);
  const tlxTotal = tlxScore(s.tlx);
  const head = [
    "participantId", "condition", "conditionOrder", "repository", "taskId", "taskKind",
    "taskName", "seededInaccurate", "errorDetected", "elapsedSeconds", "answer",
    "confidence", "isCorrect", "startTimeIso", "completionTimeIso", "susScore", "tlxScore",
  ].join(",");
  const rows = s.tasks.map((t) =>
    [
      s.participantId, s.condition, s.conditionOrder, s.repository, t.id, t.kind,
      t.name, t.seededInaccurate ?? false, t.errorDetected ?? "", t.elapsedSeconds,
      t.answer, t.confidence, t.isCorrect ?? "", t.startTimeIso ?? "", t.completionTimeIso ?? "",
      susTotal, tlxTotal,
    ].map(csvEscape).join(",")
  );
  return [head, ...rows].join("\n");
}

export function download(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
