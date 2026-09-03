import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const CORE_ARTEFACT_COMMIT = "85ab075065732b3652acabf8f67d2cee33e14d6f";

type RepositoryKey = "warehouse-dispatch" | "clinic-triage";
type Phase = "setup" | "prepared" | "tasks" | "sus" | "feedback" | "complete";

type StudyTask = {
  id: number;
  category: "orientation" | "type-processing" | "cross-cutting" | "change-impact";
  title: string;
  prompt: string;
};

type TaskResult = StudyTask & {
  answer: string;
  completed: boolean;
  startedAt: string;
  completedAt: string;
  durationMs: number;
};

const REPOSITORIES: Record<
  RepositoryKey,
  { label: string; url: string; commit: string; tasks: StudyTask[] }
> = {
  "warehouse-dispatch": {
    label: "warehouse-dispatch",
    url: "https://github.com/ionuthub/warehouse-dispatch",
    commit: "937be9d5598f81703e95c1a3ce2a2ec234287ee9",
    tasks: [
      {
        id: 1,
        category: "orientation",
        title: "Project orientation",
        prompt: "Where does execution start in this project? Describe the startup flow.",
      },
      {
        id: 2,
        category: "type-processing",
        title: "Type-specific processing",
        prompt:
          "Which code decides how a given order type is processed? Explain how the correct handler is selected.",
      },
      {
        id: 3,
        category: "cross-cutting",
        title: "Cross-cutting behaviour",
        prompt:
          "Stock is reserved in more than one place in this codebase. Find every production place where it happens. Test files do not count.",
      },
      {
        id: 4,
        category: "change-impact",
        title: "Change-impact reasoning",
        prompt:
          "A new order type is to be added. Where would you add it, and what else would need to change for the application to work?",
      },
    ],
  },
  "clinic-triage": {
    label: "clinic-triage",
    url: "https://github.com/ionuthub/clinic-triage",
    commit: "67d7a5a0c37452946876b0e7626b6c882888d4f0",
    tasks: [
      {
        id: 1,
        category: "orientation",
        title: "Project orientation",
        prompt: "Where does execution start in this project? Describe the startup flow.",
      },
      {
        id: 2,
        category: "type-processing",
        title: "Type-specific processing",
        prompt:
          "Which code decides how a given referral type is processed? Explain how the correct route handler is selected.",
      },
      {
        id: 3,
        category: "cross-cutting",
        title: "Cross-cutting behaviour",
        prompt:
          "Eligibility is checked in more than one place in this codebase. Find every production place where it happens. Test files do not count.",
      },
      {
        id: 4,
        category: "change-impact",
        title: "Change-impact reasoning",
        prompt:
          "A new referral type is to be added. Where would you add it, and what else would need to change for the application to work?",
      },
    ],
  },
};

const SUS_ITEMS = [
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

function calculateSusScore(responses: number[]): number {
  const contribution = responses.reduce((total, value, index) => {
    return total + (index % 2 === 0 ? value - 1 : 5 - value);
  }, 0);
  return contribution * 2.5;
}

function downloadJson(filename: string, value: unknown) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function Study() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [participantId, setParticipantId] = useState("");
  const [repositoryKey, setRepositoryKey] = useState<RepositoryKey>("warehouse-dispatch");
  const [sessionStartedAt, setSessionStartedAt] = useState<string | null>(null);
  const [taskIndex, setTaskIndex] = useState(0);
  const [taskStartedAt, setTaskStartedAt] = useState<number | null>(null);
  const [answer, setAnswer] = useState("");
  const [taskResults, setTaskResults] = useState<TaskResult[]>([]);
  const [susResponses, setSusResponses] = useState<(number | null)[]>(Array(10).fill(null));
  const [helped, setHelped] = useState("");
  const [difficult, setDifficult] = useState("");
  const [improve, setImprove] = useState("");

  const repository = REPOSITORIES[repositoryKey];
  const currentTask = repository.tasks[taskIndex];
  const susComplete = susResponses.every((value) => value !== null);
  const feedbackComplete = [helped, difficult, improve].every((value) => value.trim().length > 0);

  const susScore = useMemo(() => {
    if (!susComplete) return null;
    return calculateSusScore(susResponses as number[]);
  }, [susComplete, susResponses]);

  const prepareSession = () => {
    if (!participantId.trim()) return;
    setPhase("prepared");
  };

  const beginTasks = () => {
    const now = Date.now();
    setSessionStartedAt(new Date(now).toISOString());
    setTaskStartedAt(now);
    setPhase("tasks");
  };

  const finishTask = (completed: boolean) => {
    if (!currentTask || !taskStartedAt || (completed && !answer.trim())) return;
    const now = Date.now();
    setTaskResults((results) => [
      ...results,
      {
        ...currentTask,
        answer: completed ? answer.trim() : "",
        completed,
        startedAt: new Date(taskStartedAt).toISOString(),
        completedAt: new Date(now).toISOString(),
        durationMs: now - taskStartedAt,
      },
    ]);
    setAnswer("");

    if (taskIndex === repository.tasks.length - 1) {
      setTaskStartedAt(null);
      setPhase("sus");
    } else {
      setTaskIndex((index) => index + 1);
      setTaskStartedAt(now);
    }
  };

  const exportSession = () => {
    if (!sessionStartedAt || susScore === null || !feedbackComplete) return;
    const completedAt = new Date().toISOString();
    const payload = {
      schemaVersion: 3,
      protocolVersion: "usability-v1",
      participant: {
        id: participantId.trim(),
      },
      coreArtefactCommit: CORE_ARTEFACT_COMMIT,
      repository: {
        name: repository.label,
        url: repository.url,
        commit: repository.commit,
      },
      session: {
        startedAt: sessionStartedAt,
        completedAt,
      },
      tasks: taskResults.map((result) => ({
        ...result,
        durationSeconds: Math.round(result.durationMs / 100) / 10,
      })),
      sus: {
        responses: susResponses,
        score: susScore,
      },
      feedback: {
        helped: helped.trim(),
        difficult: difficult.trim(),
        improve: improve.trim(),
      },
    };

    const safeId = participantId.trim().replace(/[^a-zA-Z0-9_-]+/g, "-") || "participant";
    downloadJson(`study-${safeId}-${repository.label}.json`, payload);
    setPhase("complete");
  };

  const resetSession = () => {
    setPhase("setup");
    setParticipantId("");
    setRepositoryKey("warehouse-dispatch");
    setSessionStartedAt(null);
    setTaskIndex(0);
    setTaskStartedAt(null);
    setAnswer("");
    setTaskResults([]);
    setSusResponses(Array(10).fill(null));
    setHelped("");
    setDifficult("");
    setImprove("");
  };

  return (
    <main className="container mx-auto max-w-4xl px-4 py-10 md:px-8">
      <div className="mb-8">
        <p className="text-metadata uppercase tracking-wider text-muted-foreground">Research study</p>
        <h1 className="mt-2 text-view font-semibold text-foreground">Repository comprehension usability test</h1>
        <p className="mt-3 max-w-2xl text-body text-muted-foreground">
          Complete the four tasks using Codemap. Use only the study ID provided by the researcher; do not enter your name or email address.
        </p>
      </div>

      {phase === "setup" && (
        <section className="space-y-6 rounded-lg border border-border bg-card p-6">
          <p className="rounded-md border border-border bg-muted/30 p-4 text-ui text-muted-foreground">
            Eligibility: current Year 3 Computer Science student. Eligibility is confirmed by the researcher during recruitment.
          </p>

          <div className="space-y-2">
            <Label htmlFor="participant-id">Participant ID</Label>
            <Input
              id="participant-id"
              value={participantId}
              onChange={(event) => setParticipantId(event.target.value)}
              placeholder="e.g. P01"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="repository">Assigned repository</Label>
            <select
              id="repository"
              value={repositoryKey}
              onChange={(event) => setRepositoryKey(event.target.value as RepositoryKey)}
              className="h-10 w-full rounded-md border border-control-border bg-input px-3 text-ui text-foreground focus-ring"
            >
              <option value="warehouse-dispatch">warehouse-dispatch</option>
              <option value="clinic-triage">clinic-triage</option>
            </select>
          </div>

          <Button onClick={prepareSession} disabled={!participantId.trim()}>
            Prepare session
          </Button>
        </section>
      )}

      {phase === "prepared" && (
        <section className="space-y-6 rounded-lg border border-border bg-card p-6">
          <div>
            <h2 className="text-section font-semibold text-foreground">Researcher preparation</h2>
            <p className="mt-2 text-body text-muted-foreground">
              Before handing control to the participant, open Codemap in a second tab, analyse the assigned repository, and wait until the workspace is ready. Do not explore the repository before the timed tasks begin.
            </p>
          </div>

          <div className="rounded-md border border-border bg-code-background p-4 font-mono text-ui text-foreground">
            {repository.url}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => window.open("/", "_blank", "noopener,noreferrer")}>
              Open Codemap in new tab
            </Button>
            <Button variant="outline" onClick={() => navigator.clipboard?.writeText(repository.url)}>
              Copy repository URL
            </Button>
          </div>

          <div className="border-t border-border pt-5">
            <Button onClick={beginTasks}>Begin timed tasks</Button>
          </div>
        </section>
      )}

      {phase === "tasks" && currentTask && (
        <section className="space-y-6 rounded-lg border border-border bg-card p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-metadata text-muted-foreground">
                Task {taskIndex + 1} of {repository.tasks.length}
              </p>
              <h2 className="mt-1 text-section font-semibold text-foreground">{currentTask.title}</h2>
            </div>
            <span className="rounded-full border border-border px-3 py-1 text-metadata text-muted-foreground">
              {repository.label}
            </span>
          </div>

          <p className="text-body font-medium text-foreground">{currentTask.prompt}</p>

          <div className="space-y-2">
            <Label htmlFor="task-answer">Your answer</Label>
            <Textarea
              id="task-answer"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              rows={8}
              placeholder="Write your answer here. Include file paths or code locations where relevant."
            />
          </div>

          <p className="text-metadata text-muted-foreground">
            The task timer stops when you submit or skip this task. Answers cannot be edited after submission.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => finishTask(true)} disabled={!answer.trim()}>
              {taskIndex === repository.tasks.length - 1 ? "Submit task and continue" : "Submit and next task"}
            </Button>
            <Button variant="outline" onClick={() => finishTask(false)}>
              Unable to answer / skip
            </Button>
          </div>
        </section>
      )}

      {phase === "sus" && (
        <section className="space-y-7 rounded-lg border border-border bg-card p-6">
          <div>
            <h2 className="text-section font-semibold text-foreground">System Usability Scale</h2>
            <p className="mt-2 text-body text-muted-foreground">
              For each statement, select one response from 1 (strongly disagree) to 5 (strongly agree).
            </p>
          </div>

          {SUS_ITEMS.map((item, index) => (
            <fieldset key={item} className="space-y-3 border-b border-border pb-5 last:border-0">
              <legend className="text-ui font-medium text-foreground">
                {index + 1}. {item}
              </legend>
              <div className="flex flex-wrap items-center gap-4">
                {[1, 2, 3, 4, 5].map((value) => (
                  <label key={value} className="flex items-center gap-2 text-ui text-muted-foreground">
                    <input
                      type="radio"
                      name={`sus-${index}`}
                      value={value}
                      checked={susResponses[index] === value}
                      onChange={() =>
                        setSusResponses((responses) =>
                          responses.map((response, responseIndex) => (responseIndex === index ? value : response)),
                        )
                      }
                    />
                    {value}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}

          <Button onClick={() => setPhase("feedback")} disabled={!susComplete}>
            Continue
          </Button>
        </section>
      )}

      {phase === "feedback" && (
        <section className="space-y-6 rounded-lg border border-border bg-card p-6">
          <div>
            <h2 className="text-section font-semibold text-foreground">Final questions</h2>
            <p className="mt-2 text-body text-muted-foreground">Please answer all three questions briefly.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="helped">What helped you understand the repository?</Label>
            <Textarea id="helped" value={helped} onChange={(event) => setHelped(event.target.value)} rows={4} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="difficult">What was difficult or confusing?</Label>
            <Textarea id="difficult" value={difficult} onChange={(event) => setDifficult(event.target.value)} rows={4} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="improve">What would you improve?</Label>
            <Textarea id="improve" value={improve} onChange={(event) => setImprove(event.target.value)} rows={4} />
          </div>

          <Button onClick={exportSession} disabled={!feedbackComplete}>
            Export participant data
          </Button>
        </section>
      )}

      {phase === "complete" && (
        <section className="space-y-5 rounded-lg border border-border bg-card p-6">
          <h2 className="text-section font-semibold text-foreground">Session complete</h2>
          <p className="text-body text-muted-foreground">
            The pseudonymised JSON record has been exported. The researcher will mark the four written answers separately against the verified reference answers.
          </p>
          <Button onClick={resetSession}>Start next participant</Button>
        </section>
      )}
    </main>
  );
}
