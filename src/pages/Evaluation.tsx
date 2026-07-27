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
import {
  Condition, StudySession, StudyTask, TLX_SCALES, TlxRatings, GroundTruthFile,
  tasksFromGroundTruth, susScore, tlxScore, sessionToCsv, download,
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

/** Built-in demonstration task set; real sessions import the study's answer key JSON. */
const DEMO_TASKS: GroundTruthFile = {
  repository: "demo",
  tasks: [
    { id: 1, kind: "locating", name: "Locate the routing structure", description: "Find the file defining the application's navigation paths.", expectedFiles: ["src/App.tsx"], answerKey: "Routing is declared in src/App.tsx." },
    { id: 2, kind: "locating", name: "Locate authentication handling", description: "Find where session validation or login is handled.", expectedFiles: ["src/hooks/useGitHubAuth.ts"], answerKey: "Authentication is handled in src/hooks/useGitHubAuth.ts." },
    { id: 3, kind: "applied", name: "Plan a change", description: "Where would a new user-profile feature be added, and what else would need to change? Explain your reasoning.", expectedFiles: [], answerKey: "Marked against the rubric: correct insertion point plus at least two affected areas." },
  ],
};

type Phase = "setup" | "tasks" | "retention" | "tlx" | "sus" | "export";

export default function EvaluationPage() {
  const { toast } = useToast();
  const [phase, setPhase] = useState<Phase>("setup");

  // --- session setup ---
  const [participantId, setParticipantId] = useState("");
  const [condition, setCondition] = useState<Condition>("tool");
  const [order, setOrder] = useState<"manual-first" | "tool-first">("manual-first");
  const [repository, setRepository] = useState("");
  const [tasks, setTasks] = useState<StudyTask[]>(tasksFromGroundTruth(DEMO_TASKS));
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- runtime ---
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [retentionAnswer, setRetentionAnswer] = useState("");
  const [retentionConfidence, setRetentionConfidence] = useState(3);
  // Confirmed by the observer rather than asserted by the export. The protocol requires the
  // tool to be hidden for this phase; recording it as true regardless would mean the export
  // claimed a condition nobody verified.
  const [retentionToolHidden, setRetentionToolHidden] = useState(false);
  const [tlx, setTlx] = useState<TlxRatings>({ mental: 50, physical: 50, temporal: 50, performance: 50, effort: 50, frustration: 50 });
  const [sus, setSus] = useState<Record<number, number>>(Object.fromEntries(Array.from({ length: 10 }, (_, i) => [i, 3])));
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
      retentionAnswer, retentionConfidence, tlx, sus, notes,
    });
  }, [phase, participantId, condition, order, repository, tasks, activeTaskId,
      retentionAnswer, retentionConfidence, tlx, sus, notes]);

  const restoreSession = (stored: PersistedSession) => {
    setPhase(stored.phase as Phase);
    setParticipantId(stored.participantId);
    setCondition(stored.condition);
    setOrder(stored.order);
    setRepository(stored.repository);
    setTasks(stored.tasks);
    // The timer is not resumed: elapsed time is derived from the recorded timestamps, and
    // restarting it would attribute the interruption to the participant.
    setActiveTaskId(null);
    setRetentionAnswer(stored.retentionAnswer);
    setRetentionConfidence(stored.retentionConfidence);
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
        // browsers throttle timers in background tabs, which would under-report task time —
        // the study's primary dependent variable — by an amount correlated with condition.
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
  const appliedTask = tasks.find((t) => t.kind === "applied");

  const buildSession = (): StudySession => ({
    participantId: participantId || "unassigned",
    condition, conditionOrder: order,
    repository: repository || "unspecified",
    startedAtIso, tasks, tlx, sus, notes,
  });

  const exportJson = () => {
    const session = buildSession();
    const payload = {
      session,
      retention: {
        // The prompt the participant was actually given, not the internal task label.
        question: appliedTask?.description ?? "",
        taskName: appliedTask?.name ?? "",
        answer: retentionAnswer,
        confidence: retentionConfidence,
        administeredWithoutTool: retentionToolHidden,
      },
      scores: { sus: susScore(sus), tlxRaw: tlxScore(tlx) },
      pilotMetrics: readMetrics(),
      exportedAt: new Date().toISOString(),
    };
    download(`session_${session.participantId}_${condition}.json`, JSON.stringify(payload, null, 2), "application/json");
  };

  const exportCsv = () => {
    download(`session_${participantId || "unassigned"}_${condition}.csv`, sessionToCsv(buildSession()), "text/csv");
  };

  return (
    <div className="min-h-screen bg-background p-6 max-w-3xl mx-auto space-y-6">
      <SEO title="Evaluation Session" description="Controlled study session runner" />
      {restorable && (
        <div className="rounded-md border border-warning/60 bg-warning/10 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <p className="text-ui font-semibold text-foreground">An unfinished session is saved on this device</p>
              <p className="text-meta text-muted-foreground">
                Participant {restorable.participantId || "unassigned"} · {restorable.condition} ·
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

      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Evaluation Session</h1>
        <Badge variant="outline">{phase.toUpperCase()}</Badge>
      </header>

      {phase === "setup" && (
        <Card><CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="pid">Participant ID</Label>
              <Input id="pid" value={participantId} onChange={(e) => setParticipantId(e.target.value)} placeholder="P01" /></div>
            <div><Label htmlFor="repo">Repository under study</Label>
              <Input id="repo" value={repository} onChange={(e) => setRepository(e.target.value)} placeholder="repo-a" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Condition for this session</Label>
              <div className="flex gap-2 mt-1">
                <Button variant={condition === "manual" ? "default" : "outline"} onClick={() => setCondition("manual")}>Manual</Button>
                <Button variant={condition === "tool" ? "default" : "outline"} onClick={() => setCondition("tool")}>Tool</Button>
              </div></div>
            <div><Label>Counterbalancing order</Label>
              <div className="flex gap-2 mt-1">
                <Button variant={order === "manual-first" ? "default" : "outline"} onClick={() => setOrder("manual-first")}>Manual first</Button>
                <Button variant={order === "tool-first" ? "default" : "outline"} onClick={() => setOrder("tool-first")}>Tool first</Button>
              </div></div>
          </div>
          <div>
            <Label>Ground-truth answer key (JSON)</Label>
            <div className="flex gap-2 mt-1">
              <input ref={fileInputRef} type="file" accept=".json" className="hidden"
                onChange={(e) => e.target.files?.[0] && importGroundTruth(e.target.files[0])} />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />Import answer key
              </Button>
              <span className="text-sm text-muted-foreground self-center">{tasks.length} tasks loaded</span>
            </div>
          </div>
          <Button className="w-full" disabled={!participantId} onClick={() => setPhase("tasks")}>
            Begin tasks
          </Button>
        </CardContent></Card>
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
                  <p className="italic">{t.seededAnswerShown}</p>
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
                    <Label className="text-sm">Confidence in this answer (1–5)</Label>
                    <Slider className="w-40" min={1} max={5} step={1} value={[t.confidence]}
                      onValueChange={([v]) => setTaskField(t.id, "confidence", v)} />
                    <Badge variant="outline">{t.confidence}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span>Scored against answer key:</span>
                    <Button size="sm" variant={t.isCorrect === true ? "default" : "outline"} onClick={() => setTaskField(t.id, "isCorrect", true)}>Correct</Button>
                    <Button size="sm" variant={t.isCorrect === false ? "default" : "outline"} onClick={() => setTaskField(t.id, "isCorrect", false)}>Incorrect</Button>
                  </div>
                </div>
              )}
            </CardContent></Card>
          ))}
          <Button className="w-full" disabled={!allTasksDone} onClick={() => setPhase("retention")}>
            Continue to retention check
          </Button>
        </>
      )}

      {phase === "retention" && (
        <Card><CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold">Retention check (answered without the tool)</h3>
          <p className="text-sm text-muted-foreground">
            Close or hide the tool now. The participant answers from memory, based on the applied task:
            <span className="font-medium"> {appliedTask?.description}</span>
          </p>
          <Textarea value={retentionAnswer} onChange={(e) => setRetentionAnswer(e.target.value)} placeholder="Participant's from-memory answer…" />
          <div className="flex items-center gap-3">
            <Label className="text-sm">Confidence (1–5)</Label>
            <Slider className="w-40" min={1} max={5} step={1} value={[retentionConfidence]} onValueChange={([v]) => setRetentionConfidence(v)} />
            <Badge variant="outline">{retentionConfidence}</Badge>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={retentionToolHidden}
              onChange={(e) => setRetentionToolHidden(e.target.checked)}
              className="h-4 w-4"
            />
            I confirm the tool was closed or hidden for this answer
          </label>
          <Button
            className="w-full"
            disabled={!retentionAnswer || !retentionToolHidden}
            onClick={() => setPhase("tlx")}
          >
            Continue to NASA-TLX
          </Button>
        </CardContent></Card>
      )}

      {phase === "tlx" && (
        <Card><CardContent className="pt-6 space-y-5">
          <h3 className="font-semibold">NASA-TLX workload (0–100)</h3>
          {TLX_SCALES.map(({ key, label, prompt }) => (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-sm"><span className="font-medium">{label}</span><span>{tlx[key]}</span></div>
              <p className="text-xs text-muted-foreground">{prompt}</p>
              <Slider min={0} max={100} step={5} value={[tlx[key]]} onValueChange={([v]) => setTlx((p) => ({ ...p, [key]: v }))} />
            </div>
          ))}
          <Button className="w-full" onClick={() => setPhase("sus")}>Continue to SUS</Button>
        </CardContent></Card>
      )}

      {phase === "sus" && (
        <Card><CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold">System Usability Scale (1 = strongly disagree, 5 = strongly agree)</h3>
          {SUS_QUESTIONS.map((q, i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <p className="text-sm flex-1">{i + 1}. {q}</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((v) => (
                  <Button key={v} size="sm" variant={sus[i] === v ? "default" : "outline"}
                    onClick={() => setSus((p) => ({ ...p, [i]: v }))}>{v}</Button>
                ))}
              </div>
            </div>
          ))}
          <Button className="w-full" onClick={() => setPhase("export")}>Review and export</Button>
        </CardContent></Card>
      )}

      {phase === "export" && (
        <Card><CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold">Session summary</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span>Participant: <Badge variant="outline">{participantId}</Badge></span>
            <span>Condition: <Badge variant="outline">{condition}</Badge></span>
            <span>SUS score: <Badge>{susScore(sus)}</Badge></span>
            <span>NASA-TLX (raw): <Badge>{tlxScore(tlx)}</Badge></span>
          </div>
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
          <p className="text-xs text-muted-foreground">
            The JSON export includes the retention answer, SUS and TLX scores, and the pilot metrics
            (indexing durations and QA response times) recorded on this device.
          </p>
        </CardContent></Card>
      )}
    </div>
  );
}
