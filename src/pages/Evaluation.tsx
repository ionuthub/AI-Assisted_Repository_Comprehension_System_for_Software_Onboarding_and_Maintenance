import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Play, CheckCircle, Clock, Download, Upload, AlertTriangle } from "lucide-react";
import SEO from "@/components/SEO";
import AnswerBody from "@/components/AnswerBody";
import {
  Condition, StudySession, StudyTask, TLX_SCALES, TlxRatings, GroundTruthFile,
  DEMO_ANSWER_KEY, EMPTY_TLX, tasksFromGroundTruth, isDemoTaskSet, canBeginTasks,
  isTlxComplete, isSusComplete, taskMaxScore, taskScore,
  susScore, tlxScore, sessionToCsv, download,
} from "@/lib/evaluation/session";
import { readMetrics } from "@/lib/evaluation/metrics";
import {
  loadSession, saveSession, clearSession, hasResumableWork, type PersistedSession,
} from "@/lib/evaluation/sessionStorage";

const SUS_QUESTIONS = [
  "I think that I would like to use this system frequently.",
  "I found the system unnecessarily complex.",
  "I thought the system was easy to use.",
  "I think that I would need the support of a technical person to be able to use this system.",
  "I found the various functions in this system were well integrated.",
  "I thought there was too much inconsistency in this system.",
  "I would imagine that most people would learn to use this system very quickly.",
  "I found the system very cumbersome to use.",
  "I felt very confident using the system.",
  "I needed to learn a lot of things before I could get going with this system.",
];

/**
 * The retention question is a task, not a phase.
 *
 * There was a dedicated "retention" phase here. Once the answer keys began carrying retention as
 * a task with `kind: "retention"`, the phase asked a question the participant had already
 * answered, and asked it wrongly, since it displayed `appliedTask.description` rather than the
 * retention task's own. A participant met the applied task's prompt twice and the retention
 * prompt never, so the retention measure recorded a second attempt at a question they had just
 * completed with the tool in front of them.
 *
 * Retention now flows through the ordinary task list, which already carries `kind` through both
 * the JSON and CSV exports.
 */
type Phase = "setup" | "tasks" | "tlx" | "sus" | "export";

/** Phases the UI can render. A persisted session naming anything else resumes at setup. */
const PHASES: readonly Phase[] = ["setup", "tasks", "tlx", "sus", "export"];
const PHASE_LABELS: Record<Phase, string> = {
  setup: "Setup",
  tasks: "Tasks",
  tlx: "NASA-TLX",
  sus: "SUS",
  export: "Export",
};

export default function EvaluationPage() {
  const { toast } = useToast();
  const [phase, setPhase] = useState<Phase>("setup");

  // --- session setup ---
  const [participantId, setParticipantId] = useState("");
  // No default. See canBeginTasks: a condition that defaults to one arm runs and exports as that
  // arm whenever nobody notices, and the mistake leaves no trace in the data.
  const [condition, setCondition] = useState<Condition | null>(null);
  const [order, setOrder] = useState<"manual-first" | "tool-first">("manual-first");
  const [repository, setRepository] = useState("");
  const [tasks, setTasks] = useState<StudyTask[]>(tasksFromGroundTruth(DEMO_ANSWER_KEY));
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- runtime ---
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Both instruments start empty. A control resting at a default records a response nobody gave,
  // and the phase buttons below refuse to advance until every item has actually been answered.
  const [tlx, setTlx] = useState<TlxRatings>(EMPTY_TLX);
  const [sus, setSus] = useState<Record<number, number | null>>({});
  const [notes, setNotes] = useState("");

  // Restore offer is decided once on mount so it does not reappear after being dismissed.
  const [restorable, setRestorable] = useState<PersistedSession | null>(null);
  const startedAtIso = useMemo(() => new Date().toISOString(), []);

  useEffect(() => {
    if (activeTaskId !== null) {
      timerRef.current = setInterval(() => {
        setTasks((prev) => prev.map((t) => (t.id === activeTaskId ? { ...t, elapsedSeconds: t.elapsedSeconds + 1 } : t)));
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [activeTaskId]);

  const importGroundTruth = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const gt = JSON.parse(String(reader.result)) as GroundTruthFile;
        if (!Array.isArray(gt.tasks) || gt.tasks.length === 0) throw new Error("no tasks");
        setTasks(tasksFromGroundTruth(gt));
        if (gt.repository) setRepository(gt.repository);
        toast({ title: "Answer key loaded", description: `${gt.tasks.length} tasks imported.` });
      } catch {
        toast({ title: "Invalid answer key", description: "Expected JSON with a tasks array.", variant: "destructive" });
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    const stored = loadSession();
    if (hasResumableWork(stored)) setRestorable(stored);
  }, []);

  // Persisted on every change rather than at phase boundaries: a session lost between
  // boundaries is exactly the case worth protecting against.
  useEffect(() => {
    saveSession({
      phase, participantId, condition, order, repository, tasks, activeTaskId,
      tlx, sus, notes,
    });
  }, [phase, participantId, condition, order, repository, tasks, activeTaskId,
      tlx, sus, notes]);

  const restoreSession = (stored: PersistedSession) => {
    // A session saved during the removed retention phase would otherwise restore to a phase
    // nothing renders, leaving the observer on a blank page mid-session.
    setPhase(PHASES.includes(stored.phase as Phase) ? (stored.phase as Phase) : "setup");
    setParticipantId(stored.participantId);
    setCondition(stored.condition);
    setOrder(stored.order);
    setRepository(stored.repository);
    setTasks(stored.tasks);
    // The timer is not resumed: elapsed time is derived from the recorded timestamps, and
    // restarting it would attribute the interruption to the participant.
    setActiveTaskId(null);
    setTlx(stored.tlx);
    setSus(stored.sus);
    setNotes(stored.notes);
    setRestorable(null);
    toast({ title: "Session restored", description: `Saved ${new Date(stored.savedAtIso).toLocaleTimeString()}.` });
  };

  const startTask = (id: number) => {
    if (activeTaskId !== null) return;
    setActiveTaskId(id);
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: "running", startTimeIso: new Date().toISOString() } : t)));
  };

  const completeTask = (id: number) => {
    setActiveTaskId(null);
    const completionTimeIso = new Date().toISOString();
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        // Derive the duration from the two timestamps rather than the interval tick count:
        // browsers throttle timers in background tabs, which would under-report task time,
        // the study's primary dependent variable, by an amount correlated with condition.
        const elapsedSeconds = t.startTimeIso
          ? Math.max(0, Math.round((Date.parse(completionTimeIso) - Date.parse(t.startTimeIso)) / 1000))
          : t.elapsedSeconds;
        return { ...t, status: "completed", completionTimeIso, elapsedSeconds };
      })
    );
  };

  const setTaskField = <K extends keyof StudyTask>(id: number, key: K, value: StudyTask[K]) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, [key]: value } : t)));

  const allTasksDone = tasks.every((t) => t.status === "completed");
  const tlxComplete = isTlxComplete(tlx);
  const susComplete = isSusComplete(sus);
  const setupReady = canBeginTasks(participantId, tasks, condition);
  const setupRequirements = [
    { label: "Participant ID", complete: participantId.trim().length > 0 },
    { label: "Session condition", complete: condition !== null },
    { label: "Study answer key", complete: tasks.length > 0 && !isDemoTaskSet(tasks) },
  ];
  const currentPhaseIndex = PHASES.indexOf(phase);

  const buildSession = (): StudySession => ({
    participantId: participantId || "unassigned",
    condition, conditionOrder: order,
    repository: repository || "unspecified",
    startedAtIso, tasks, tlx, sus, notes,
  });

  const exportJson = () => {
    const session = buildSession();
    // No `retention` block: the retention answer is the `kind: "retention"` task inside
    // `session.tasks`, with its own prompt, timing, answer and confidence. A separate block
    // would restate one task's fields at the top level and invite an analysis that counted the
    // retention answer twice, or read the block and ignored the task.
    const payload = {
      session,
      // Null rather than a computed figure when the instrument is incomplete. A score derived from
      // partial responses is not a weaker measurement of the same thing, it is a different one.
      scores: { sus: susScore(sus), tlxRaw: tlxScore(tlx) },
      instrumentsComplete: { sus: susComplete, tlx: tlxComplete },
      pilotMetrics: readMetrics(),
      exportedAt: new Date().toISOString(),
    };
    download(`session_${session.participantId}_${condition ?? "unset"}.json`, JSON.stringify(payload, null, 2), "application/json");
  };

  const exportCsv = () => {
    download(`session_${participantId || "unassigned"}_${condition ?? "unset"}.csv`, sessionToCsv(buildSession()), "text/csv");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Evaluation Session" description="Controlled study session runner" />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <header className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5">
              <p className="text-meta font-semibold uppercase tracking-[0.14em] text-primary">
                Research evaluation
              </p>
              <h1 className="text-view font-semibold tracking-tight text-foreground">Evaluation session</h1>
              <p className="text-body text-muted-foreground max-w-2xl">
                Configure the controlled study session, run the participant tasks, capture the
                workload and usability instruments, then review the export.
              </p>
            </div>
            <div className="shrink-0 rounded-full border border-control bg-input px-3 py-1.5 text-meta font-semibold text-foreground">
              Step {currentPhaseIndex + 1} of {PHASES.length}
            </div>
          </div>

          <ol className="grid grid-cols-5 gap-2" aria-label="Evaluation session progress">
            {PHASES.map((step, index) => {
              const current = step === phase;
              const complete = index < currentPhaseIndex;
              return (
                <li key={step} aria-current={current ? "step" : undefined}>
                  <div
                    className={`flex min-h-12 items-center gap-2 rounded-md border px-2.5 py-2 transition-colors sm:px-3 ${
                      current
                        ? "border-primary bg-primary/10 text-foreground"
                        : complete
                          ? "border-border bg-surface-raised text-foreground-secondary"
                          : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-meta font-semibold ${
                        current
                          ? "bg-primary text-primary-foreground"
                          : complete
                            ? "bg-surface-raised text-primary"
                            : "bg-secondary text-muted-foreground"
                      }`}
                      aria-hidden="true"
                    >
                      {complete ? "✓" : index + 1}
                    </span>
                    <span className="hidden text-meta font-semibold sm:inline">{PHASE_LABELS[step]}</span>
                  </div>
                </li>
              );
            })}
          </ol>
        </header>

        {restorable && (
          <div className="rounded-md border border-warning/60 bg-warning/10 p-4 space-y-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" aria-hidden="true" />
              <div className="space-y-1">
                <p className="text-ui font-semibold text-foreground">An unfinished session is saved on this device</p>
                <p className="text-meta text-muted-foreground">
                  Participant {restorable.participantId || "unassigned"} · {restorable.condition ?? "condition not chosen"} ·
                  saved {new Date(restorable.savedAtIso).toLocaleString()}. Restoring replaces
                  anything entered since this page loaded.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => restoreSession(restorable)}>Restore it</Button>
              <Button size="sm" variant="outline" onClick={() => { clearSession(); setRestorable(null); }}>
                Discard and start fresh
              </Button>
            </div>
          </div>
        )}

        {/*
          Which condition is running, on screen for the whole session.
          A within-subjects design depends on the manual half actually being manual. Nothing else in
          the interface said which half was in progress, so a participant could drift into the tool
          during a manual task and the observer could lose track of which half they were in, and
          neither slip leaves a trace in the export, which records the condition the observer set at
          setup regardless of what happened. The manual wording is an instruction, not a label,
          because it is the case where behaviour has to change.
        */}
        {phase !== "setup" && (
          <div
            role="status"
            className={
              condition === "manual"
                ? "rounded-md border-2 border-destructive bg-destructive/15 px-4 py-3"
                : "rounded-md border border-primary/60 bg-primary/10 px-4 py-3"
            }
          >
            <p className="text-ui font-semibold text-foreground flex items-center gap-2">
              {condition === "manual" ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-destructive shrink-0" aria-hidden="true" />
                  Condition: Manual. Do not use the tool.
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                  Condition: Tool
                </>
              )}
            </p>
            <p className="text-meta text-muted-foreground mt-0.5">
              {participantId || "unassigned"} · {repository || "unspecified"} · {order}
            </p>
          </div>
        )}

        {phase === "setup" && (
          <Card className="overflow-hidden border-border bg-card shadow-sm">
            <CardContent className="p-0">
              <section className="border-b border-border p-5 sm:p-6 space-y-4" aria-labelledby="session-details-heading">
                <div className="space-y-1">
                  <h2 id="session-details-heading" className="text-section font-semibold text-foreground">Session details</h2>
                  <p className="text-meta text-muted-foreground">
                    Identify the participant and the repository used for this half of the study.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="pid" className="text-ui font-semibold text-foreground">
                      Participant ID <span className="text-warning" aria-hidden="true">*</span>
                    </Label>
                    <Input
                      id="pid"
                      value={participantId}
                      onChange={(e) => setParticipantId(e.target.value)}
                      placeholder="P01"
                      className="h-11 border-control bg-input"
                      aria-required="true"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="repo" className="text-ui font-semibold text-foreground">Repository under study</Label>
                    <Input
                      id="repo"
                      value={repository}
                      onChange={(e) => setRepository(e.target.value)}
                      placeholder="clinic-triage"
                      className="h-11 border-control bg-input"
                    />
                    <p className="text-meta text-muted-foreground">Imported answer keys can fill this automatically.</p>
                  </div>
                </div>
              </section>

              <section className="border-b border-border p-5 sm:p-6 space-y-4" aria-labelledby="condition-heading">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h2 id="condition-heading" className="text-section font-semibold text-foreground">Condition for this session</h2>
                    <p className="text-meta text-muted-foreground max-w-2xl">
                      Choose this explicitly for every session. There is intentionally no default,
                      so a manual run cannot be accidentally recorded as a tool run.
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-meta font-semibold ${
                      condition === null
                        ? "border-warning/60 bg-warning/10 text-warning"
                        : "border-primary/50 bg-primary/10 text-primary"
                    }`}
                  >
                    {condition === null ? "Required" : "Selected"}
                  </span>
                </div>

                <div role="group" aria-labelledby="condition-heading" className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    aria-pressed={condition === "manual"}
                    onClick={() => setCondition("manual")}
                    className={`rounded-lg border p-4 text-left transition-colors ${
                      condition === "manual"
                        ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                        : "border-control bg-input hover:border-primary/60 hover:bg-surface-raised"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-ui font-semibold text-foreground">Manual</span>
                      {condition === "manual" && <CheckCircle className="h-4 w-4 text-primary" aria-hidden="true" />}
                    </span>
                    <span className="mt-1 block text-meta leading-relaxed text-muted-foreground">
                      Repository inspection without using Codemap during the tasks.
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-pressed={condition === "tool"}
                    onClick={() => setCondition("tool")}
                    className={`rounded-lg border p-4 text-left transition-colors ${
                      condition === "tool"
                        ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                        : "border-control bg-input hover:border-primary/60 hover:bg-surface-raised"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-ui font-semibold text-foreground">Tool</span>
                      {condition === "tool" && <CheckCircle className="h-4 w-4 text-primary" aria-hidden="true" />}
                    </span>
                    <span className="mt-1 block text-meta leading-relaxed text-muted-foreground">
                      Codemap is available to support repository comprehension during the tasks.
                    </span>
                  </button>
                </div>

                {condition === null && (
                  <div role="status" className="flex items-start gap-2 rounded-md border border-warning/50 bg-warning/10 p-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
                    <p className="text-meta text-foreground-secondary">
                      Choose Manual or Tool before the session can begin.
                    </p>
                  </div>
                )}
              </section>

              <section className="border-b border-border p-5 sm:p-6 space-y-4" aria-labelledby="order-heading">
                <div className="space-y-1">
                  <h2 id="order-heading" className="text-section font-semibold text-foreground">Counterbalancing order</h2>
                  <p className="text-meta text-muted-foreground">
                    Record the participant's assigned order for the two study conditions.
                  </p>
                </div>
                <div role="group" aria-labelledby="order-heading" className="grid gap-3 sm:grid-cols-2">
                  {([
                    ["manual-first", "Manual first", "The manual condition is completed before the tool condition."],
                    ["tool-first", "Tool first", "The tool condition is completed before the manual condition."],
                  ] as const).map(([value, label, description]) => {
                    const selected = order === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setOrder(value)}
                        className={`rounded-lg border p-4 text-left transition-colors ${
                          selected
                            ? "border-primary/70 bg-surface-raised ring-1 ring-primary/20"
                            : "border-control bg-input hover:border-primary/60 hover:bg-surface-raised"
                        }`}
                      >
                        <span className="flex items-center justify-between gap-3">
                          <span className="text-ui font-semibold text-foreground">{label}</span>
                          {selected && <CheckCircle className="h-4 w-4 text-primary" aria-hidden="true" />}
                        </span>
                        <span className="mt-1 block text-meta leading-relaxed text-muted-foreground">{description}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="border-b border-border p-5 sm:p-6 space-y-4" aria-labelledby="answer-key-heading">
                <div className="space-y-1">
                  <h2 id="answer-key-heading" className="text-section font-semibold text-foreground">Study answer key</h2>
                  <p className="text-meta text-muted-foreground">
                    Import the ground-truth JSON for the repository being evaluated before beginning.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && importGroundTruth(e.target.files[0])}
                  />
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-4 h-4 mr-2" aria-hidden="true" />Import answer key
                  </Button>
                  <div className="flex items-center gap-2 text-meta text-muted-foreground">
                    <span className={`h-2 w-2 rounded-full ${isDemoTaskSet(tasks) ? "bg-warning" : "bg-primary"}`} aria-hidden="true" />
                    <span>{tasks.length} tasks loaded</span>
                    <span aria-hidden="true">·</span>
                    <span>{isDemoTaskSet(tasks) ? "demonstration set" : "study key loaded"}</span>
                  </div>
                </div>
                {isDemoTaskSet(tasks) && (
                  <div className="flex items-start gap-2 rounded-md border border-warning/60 bg-warning/10 p-3">
                    <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" aria-hidden="true" />
                    <p className="text-meta text-muted-foreground">
                      <span className="font-semibold text-foreground">Demonstration tasks are loaded.</span>{" "}
                      Their answer keys are placeholders, so a session run on them would export in the
                      shape of study data with nothing to score against. Import the study's answer key
                      before beginning.
                    </p>
                  </div>
                )}
              </section>

              <div className="bg-secondary/5 p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2">
                    <p className="text-ui font-semibold text-foreground">
                      {setupReady ? "Ready to begin" : "Complete the required setup"}
                    </p>
                    <div className="flex flex-wrap gap-2" aria-label="Setup readiness">
                      {setupRequirements.map((item) => (
                        <span
                          key={item.label}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-meta ${
                            item.complete
                              ? "border-primary/40 bg-primary/10 text-foreground-secondary"
                              : "border-border bg-card text-muted-foreground"
                          }`}
                        >
                          <span className={item.complete ? "text-primary" : "text-muted-foreground"} aria-hidden="true">
                            {item.complete ? "✓" : "○"}
                          </span>
                          {item.label}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button
                    className="w-full sm:w-auto sm:min-w-40"
                    disabled={!setupReady}
                    onClick={() => setPhase("tasks")}
                  >
                    Begin tasks
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {phase === "tasks" && (
          <>
            {tasks.map((t) => (
              <Card key={t.id}><CardContent className="pt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={t.kind === "applied" ? "default" : "secondary"}>{t.kind}</Badge>
                    <h3 className="font-semibold">{t.name}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />{t.elapsedSeconds}s
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{t.description}</p>

                {t.seededInaccurate && condition === "tool" && t.status !== "idle" && (
                  <div className="border border-amber-500/50 rounded p-3 text-sm space-y-2">
                    <div className="flex items-center gap-2 font-medium">
                      <AlertTriangle className="w-4 h-4" />Tool answer shown to participant:
                    </div>
                    {/*
                      Rendered by the same component as the workspace Answers tab, so a pre-recorded
                      seeded answer is laid out exactly as a live one. It was previously a single
                      italic run with newlines collapsed and markdown left as literal characters,
                      which made the one known-wrong answer in the session the one that looked
                      unlike all the others. A participant flagging it might then be reporting that
                      it looked odd rather than that they checked it, and the export cannot tell
                      those apart.
                    */}
                    <div className="max-w-[68ch]"><AnswerBody content={t.seededAnswerShown ?? ""} /></div>
                    <div className="flex gap-2 items-center">
                      <span>Participant flagged this answer as incorrect?</span>
                      <Button size="sm" variant={t.errorDetected ? "default" : "outline"} onClick={() => setTaskField(t.id, "errorDetected", true)}>Yes</Button>
                      <Button size="sm" variant={t.errorDetected === false ? "default" : "outline"} onClick={() => setTaskField(t.id, "errorDetected", false)}>No</Button>
                    </div>
                  </div>
                )}

                {t.status === "idle" && (
                  <Button onClick={() => startTask(t.id)} disabled={activeTaskId !== null}>
                    <Play className="w-4 h-4 mr-2" />Start
                  </Button>
                )}
                {t.status === "running" && (
                  <div className="space-y-3">
                    <Textarea value={t.answer} onChange={(e) => setTaskField(t.id, "answer", e.target.value)} placeholder="Participant's answer…" />
                    <Button onClick={() => completeTask(t.id)}><CheckCircle className="w-4 h-4 mr-2" />Complete task</Button>
                  </div>
                )}
                {t.status === "completed" && (
                  <div className="space-y-2">
                    <p className="text-sm"><span className="font-medium">Answer: </span>{t.answer || "—"}</p>
                    <div className="flex items-center gap-3">
                      <Label className="text-sm" htmlFor={`confidence-${t.id}`}>
                        Confidence in this answer (1–5)
                      </Label>
                      <Slider
                        id={`confidence-${t.id}`}
                        className={`w-40 ${t.confidence === null ? "opacity-50" : ""}`}
                        min={1} max={5} step={1}
                        value={[t.confidence ?? 3]}
                        aria-label={`Confidence for ${t.name}`}
                        aria-valuetext={t.confidence === null ? "not recorded" : String(t.confidence)}
                        onValueChange={([v]) => setTaskField(t.id, "confidence", v)}
                      />
                      <Badge variant={t.confidence === null ? "destructive" : "outline"}>
                        {t.confidence ?? "not recorded"}
                      </Badge>
                    </div>

                    {/*
                      Locating tasks are binary; applied and retention tasks are 0-2. That split is
                      the marking rubric in the protocol and the answer keys, which award 1 for the
                      correct insertion point and 1 for at least two further affected areas. The
                      runner used to offer Correct/Incorrect for every kind, so an answer worth 1 of
                      2 had to be forced into one or the other and half the rubric could not be
                      recorded at all.
                    */}
                    {t.kind === "locating" ? (
                      <div className="flex items-center gap-2 text-sm">
                        <span>Scored against answer key:</span>
                        <Button size="sm" variant={t.isCorrect === true ? "default" : "outline"} onClick={() => setTaskField(t.id, "isCorrect", true)}>Correct</Button>
                        <Button size="sm" variant={t.isCorrect === false ? "default" : "outline"} onClick={() => setTaskField(t.id, "isCorrect", false)}>Incorrect</Button>
                        {t.isCorrect === null && (
                          <Badge variant="destructive">not marked</Badge>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm flex-wrap">
                        <span>Rubric score (0–2):</span>
                        {[0, 1, 2].map((p) => (
                          <Button
                            key={p}
                            size="sm"
                            variant={t.points === p ? "default" : "outline"}
                            onClick={() => setTaskField(t.id, "points", p)}
                            aria-pressed={t.points === p}
                          >
                            {p}
                          </Button>
                        ))}
                        {t.points === null && <Badge variant="destructive">not marked</Badge>}
                        <span className="text-meta text-muted-foreground w-full">
                          1 for the correct insertion point, 1 for at least two further affected
                          areas with written justification.
                        </span>
                      </div>
                    )}

                    <p className="text-meta text-muted-foreground">
                      Score: {taskScore(t) ?? "—"} / {taskMaxScore(t.kind)}
                    </p>
                  </div>
                )}
              </CardContent></Card>
            ))}
            <Button className="w-full" disabled={!allTasksDone} onClick={() => setPhase("tlx")}>
              Continue to NASA-TLX
            </Button>
          </>
        )}

        {phase === "tlx" && (
          <Card><CardContent className="pt-6 space-y-5">
            <h2 className="text-panel font-semibold">NASA-TLX workload (0–100)</h2>
            <p className="text-meta text-muted-foreground">
              Click or drag every scale, including any the participant leaves at the middle. A scale
              that is never touched is exported as unrecorded, not as 50.
            </p>
            {TLX_SCALES.map(({ key, label, prompt }) => (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{label}</span>
                  <span className={tlx[key] === null ? "text-destructive font-medium" : ""}>
                    {tlx[key] ?? "not recorded"}
                  </span>
                </div>
                <p className="text-meta text-muted-foreground">{prompt}</p>
                <Slider
                  min={0} max={100} step={5}
                  className={tlx[key] === null ? "opacity-50" : ""}
                  value={[tlx[key] ?? 50]}
                  aria-label={label}
                  aria-valuetext={tlx[key] === null ? "not recorded" : String(tlx[key])}
                  onValueChange={([v]) => setTlx((p) => ({ ...p, [key]: v }))}
                />
              </div>
            ))}
            <Button className="w-full" disabled={!tlxComplete} onClick={() => setPhase("sus")}>
              {tlxComplete
                ? "Continue to SUS"
                : `Continue to SUS · ${TLX_SCALES.filter(({ key }) => tlx[key] === null).length} scale(s) not recorded`}
            </Button>
          </CardContent></Card>
        )}

        {phase === "sus" && (
          <Card><CardContent className="pt-6 space-y-4">
            <h2 className="text-panel font-semibold">System Usability Scale</h2>
            <p className="text-meta text-muted-foreground">
              1 = strongly disagree, 5 = strongly agree. All ten items are required. SUS has no
              defined score from a partial response, so an unfinished questionnaire is exported
              without one rather than with an estimate.
            </p>
            {SUS_QUESTIONS.map((q, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <p className="text-sm flex-1">
                  {i + 1}. {q}
                  {sus[i] == null && <span className="text-destructive"> ·&nbsp;unanswered</span>}
                </p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <Button key={v} size="sm" variant={sus[i] === v ? "default" : "outline"}
                      aria-pressed={sus[i] === v}
                      onClick={() => setSus((p) => ({ ...p, [i]: v }))}>{v}</Button>
                  ))}
                </div>
              </div>
            ))}
            <Button className="w-full" disabled={!susComplete} onClick={() => setPhase("export")}>
              {susComplete
                ? "Review and export"
                : `Review and export · ${SUS_QUESTIONS.filter((_, i) => sus[i] == null).length} item(s) unanswered`}
            </Button>
          </CardContent></Card>
        )}

        {phase === "export" && (
          <Card><CardContent className="pt-6 space-y-4">
            <h2 className="text-panel font-semibold">Session summary</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span>Participant: <Badge variant="outline">{participantId}</Badge></span>
              <span>Condition: <Badge variant="outline">{condition ?? "not set"}</Badge></span>
              <span>SUS score: <Badge variant={susComplete ? "default" : "destructive"}>{susScore(sus) ?? "incomplete"}</Badge></span>
              <span>NASA-TLX (raw): <Badge variant={tlxComplete ? "default" : "destructive"}>{tlxScore(tlx) ?? "incomplete"}</Badge></span>
            </div>

            {/* Marking is the observer's, and an unmarked task is easy to miss on a long list. */}
            {tasks.some((t) => taskScore(t) === null || t.confidence === null) && (
              <div className="flex items-start gap-2 rounded-md border border-warning/60 bg-warning/10 p-3">
                <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-meta text-muted-foreground">
                  <span className="font-semibold text-foreground">Not every task is fully recorded.</span>{" "}
                  {tasks.filter((t) => taskScore(t) === null).map((t) => `Q${t.id}`).join(", ") || "None"} unmarked;{" "}
                  {tasks.filter((t) => t.confidence === null).map((t) => `Q${t.id}`).join(", ") || "none"} without a
                  confidence rating. Exporting is still allowed, the gaps are recorded as gaps, but
                  fill them now if the participant is still present.
                </p>
              </div>
            )}

            <p className="text-meta text-muted-foreground">
              Total score:{" "}
              {tasks.reduce((n, t) => n + (taskScore(t) ?? 0), 0)} /{" "}
              {tasks.reduce((n, t) => n + taskMaxScore(t.kind), 0)}
              {" "}(unmarked tasks count as 0 in this preview only; the export records them as null)
            </p>
            <div>
              <Label htmlFor="notes">Observer notes</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Think-aloud observations, incidents, deviations…" />
            </div>
            <div className="flex gap-2">
              <Button onClick={exportJson}><Download className="w-4 h-4 mr-2" />Export JSON</Button>
              <Button variant="outline" onClick={exportCsv}><Download className="w-4 h-4 mr-2" />Export CSV</Button>
              <Button
                variant="outline"
                onClick={() => {
                  clearSession();
                  toast({ title: "Saved session cleared", description: "Export first if you have not already." });
                }}
              >
                Clear saved session
              </Button>
            </div>
            <p className="text-meta text-muted-foreground">
              The JSON export includes every task with its own timing, answer and confidence, the
              retention task among them, plus the SUS and TLX scores and the pilot metrics
              (indexing durations and QA response times) recorded on this device.
            </p>
          </CardContent></Card>
        )}
      </div>
    </div>
  );
}