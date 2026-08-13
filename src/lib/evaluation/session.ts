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
  /**
   * 1-5, captured after each task. Null until the observer actually records it.
   *
   * It previously defaulted to 3, so a session where confidence was never asked exported a full
   * set of mid-scale ratings indistinguishable from a participant who genuinely felt neutral
   * about every answer. Confidence feeds the confidence-accuracy gap, so an invented 3 does not
   * merely add noise — it pulls the gap toward zero, which is the direction that would understate
   * over-trust.
   */
  confidence: number | null;
  /**
   * Locating tasks only: scored against the answer key by the experimenter. Null until marked.
   *
   * Applied and retention tasks use `points` instead, because the rubric awards 0-2 for them.
   */
  isCorrect: boolean | null;
  /**
   * Applied and retention tasks only: 0, 1 or 2 against the rubric. Null until marked.
   *
   * The protocol, the answer keys and the marking rubric all commit to 0-2 for these two kinds —
   * 1 for the correct insertion point, 1 for at least two further affected areas, with written
   * justification. The runner previously offered only Correct/Incorrect, so an answer worth 1 of 2
   * had to be recorded as one or the other, and half the rubric was unrecordable.
   */
  points: number | null;
  /** For seeded tasks: did the participant flag the tool's answer as wrong? */
  errorDetected: boolean | null;
}

/** Points available for a task kind: locating is binary, applied and retention are scored 0-2. */
export function taskMaxScore(kind: TaskKind): number {
  return kind === "locating" ? 1 : 2;
}

/**
 * The task's score out of `taskMaxScore(kind)`, or null while it is unmarked.
 *
 * Reading this rather than `isCorrect` is what keeps a 0-2 task from being counted as a binary
 * one. It is exported alongside the raw fields so analysis does not have to re-derive the rule.
 */
export function taskScore(task: Pick<StudyTask, "kind" | "isCorrect" | "points">): number | null {
  if (task.kind === "locating") {
    return task.isCorrect === null ? null : task.isCorrect ? 1 : 0;
  }
  return task.points;
}

/**
 * The six NASA-TLX subscales, 0-100. Null means not yet recorded.
 *
 * Every subscale used to start at 50. A slider already sitting at the midpoint records a rating
 * whether or not anyone touched it, so an unadministered TLX exported as a complete instrument
 * reading exactly 50 on all six — a plausible-looking response with no participant behind it.
 */
export interface TlxRatings {
  mental: number | null;
  physical: number | null;
  temporal: number | null;
  performance: number | null;
  effort: number | null;
  frustration: number | null;
}

/** A TLX response with nothing recorded yet. */
export const EMPTY_TLX: TlxRatings = {
  mental: null, physical: null, temporal: null,
  performance: null, effort: null, frustration: null,
};

export const TLX_KEYS: (keyof TlxRatings)[] = [
  "mental", "physical", "temporal", "performance", "effort", "frustration",
];

/** True once every subscale carries a recorded value. */
export const isTlxComplete = (t: TlxRatings): boolean =>
  TLX_KEYS.every((k) => t[k] !== null);

/** True once all ten SUS items carry a recorded value. */
export const isSusComplete = (ratings: Record<number, number | null>): boolean =>
  Array.from({ length: 10 }, (_, i) => i).every((i) => typeof ratings[i] === "number");

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
  sus: Record<number, number | null>; // question index (0-9) -> 1..5, null until answered
  notes: string;
}

/**
 * Raw NASA-TLX (unweighted mean of the six subscales, 0-100), or null if any is unrecorded.
 *
 * A partial instrument has no defined score. Averaging the answered subscales would silently
 * change what the number means between participants, so it returns null and the caller reports
 * the instrument as incomplete.
 */
export function tlxScore(t: TlxRatings): number | null {
  if (!isTlxComplete(t)) return null;
  const vals = TLX_KEYS.map((k) => t[k] as number);
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
}

/**
 * Standard SUS scoring (Brooke 1996): odd items score r-1, even items 5-r, sum * 2.5.
 *
 * Returns null unless all ten items are answered. The previous implementation substituted 3 for a
 * missing item, which is not neutral: on an odd item 3 contributes 2 and on an even item it also
 * contributes 2, so ten unanswered items scored exactly 50 — a mid-scale usability result
 * manufactured entirely from absent data, and one that would have been compared against the
 * published benchmark of 68 as though a participant had produced it.
 */
export function susScore(ratings: Record<number, number | null>): number | null {
  if (!isSusComplete(ratings)) return null;
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    const r = ratings[i] as number;
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
    { id: 2, kind: "locating", name: "Locate ingestion filtering", description: "Find where excluded directories such as node_modules are filtered out.", expectedFiles: ["src/lib/ingestionFilters.ts"], answerKey: "Exclusion rules are applied in src/lib/ingestionFilters.ts." },
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
    // Null, not 3. See the field comment on StudyTask.confidence.
    confidence: null,
    isCorrect: null,
    points: null,
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
// Unrecorded values are written as empty cells, never as a substituted default. An empty cell
// loads as NaN/NA in pandas or R and forces a decision; a fabricated 3 or 50 loads as data.
export function sessionToCsv(s: StudySession): string {
  const susTotal = susScore(s.sus);
  const tlxTotal = tlxScore(s.tlx);
  const head = [
    "participantId", "condition", "conditionOrder", "repository", "taskId", "taskKind",
    "taskName", "seededInaccurate", "errorDetected", "elapsedSeconds", "answer",
    "confidence", "isCorrect", "points", "score", "maxScore",
    "startTimeIso", "completionTimeIso", "susScore", "tlxScore",
  ].join(",");
  const rows = s.tasks.map((t) =>
    [
      s.participantId, s.condition, s.conditionOrder, s.repository, t.id, t.kind,
      t.name, t.seededInaccurate ?? false, t.errorDetected ?? "", t.elapsedSeconds,
      t.answer, t.confidence ?? "", t.isCorrect ?? "", t.points ?? "",
      taskScore(t) ?? "", taskMaxScore(t.kind),
      t.startTimeIso ?? "", t.completionTimeIso ?? "",
      susTotal ?? "", tlxTotal ?? "",
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
