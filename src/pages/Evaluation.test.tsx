import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// `download` is the only side effect of exporting, so it is the seam the export payload can be
// read through. Everything else in the module — scoring, CSV, the task model — stays real, so
// what fails these tests is a change to the payload shape rather than a change to a stub.
vi.mock('@/lib/evaluation/session', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/evaluation/session')>()),
  download: vi.fn(),
}));

import EvaluationPage from './Evaluation';
import { download, type GroundTruthFile } from '@/lib/evaluation/session';

/** An answer key in the shape the study now uses: retention is a task, not a phase. */
const ANSWER_KEY: GroundTruthFile = {
  repository: 'clinic-triage',
  tasks: [
    {
      id: 1,
      kind: 'locating',
      name: 'Locate the banding rules',
      description: 'Find where a referral is given its priority band.',
      expectedFiles: ['src/triage/banding.ts'],
      answerKey: 'calculateBand in src/triage/banding.ts.',
    },
    {
      id: 2,
      kind: 'applied',
      name: 'Plan a new referral type',
      description: 'Where would a new referral type be added, and what else would change?',
      expectedFiles: [],
      answerKey: 'Route registry plus the policy and threshold config.',
    },
    {
      id: 3,
      kind: 'retention',
      name: 'Retention — from memory, tool closed',
      description: 'Without reopening the tool, how is a referral routed to a handler?',
      expectedFiles: [],
      answerKey: 'routeReferral looks the handler up by referral type in the registry.',
    },
  ],
};

const keyFile = () =>
  new File([JSON.stringify(ANSWER_KEY)], 'answer-key.clinic-triage.json', {
    type: 'application/json',
  });

type ExportedPayload = {
  session: { tasks: { id: number; kind: string; answer: string }[] };
  scores: { sus: number; tlxRaw: number };
};

/** Fills in the setup phase and hands over to the task list. */
const beginSession = async (user: ReturnType<typeof userEvent.setup>) => {
  render(<EvaluationPage />);
  await user.type(screen.getByLabelText('Participant ID'), 'P01');

  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  await user.upload(fileInput, keyFile());

  // The import is asynchronous (FileReader). Until it lands, the demo set is still loaded and
  // canBeginTasks keeps the button disabled — which is the condition worth waiting on, because
  // the demo set also has three tasks, so the "3 tasks loaded" count would not prove anything.
  const begin = screen.getByRole('button', { name: 'Begin tasks' });
  await waitFor(() => expect(begin).toBeEnabled());
  await user.click(begin);
};

/**
 * Completes every task in order.
 *
 * Only one task may run at a time and a completed task's Start button is removed, so the first
 * remaining Start is always the next idle task and the running task owns the only answer box on
 * screen. That is why this needs no per-card DOM traversal.
 */
const completeAllTasks = async (
  user: ReturnType<typeof userEvent.setup>,
  { withAnswers = true } = {}
) => {
  for (const task of ANSWER_KEY.tasks) {
    await user.click(screen.getAllByRole('button', { name: 'Start' })[0]);
    if (withAnswers) {
      await user.type(
        screen.getByPlaceholderText("Participant's answer…"),
        `answer for ${task.kind}`
      );
    }
    await user.click(screen.getByRole('button', { name: 'Complete task' }));
  }
};

/** Runs a whole session and returns the parsed JSON payload handed to `download`. */
const runSessionToExport = async (): Promise<ExportedPayload> => {
  const user = userEvent.setup();
  await beginSession(user);
  await completeAllTasks(user);

  await user.click(screen.getByRole('button', { name: 'Continue to NASA-TLX' }));
  await user.click(screen.getByRole('button', { name: 'Continue to SUS' }));
  await user.click(screen.getByRole('button', { name: 'Review and export' }));
  await user.click(screen.getByRole('button', { name: 'Export JSON' }));

  const call = vi.mocked(download).mock.calls.at(-1);
  if (!call) throw new Error('download was never called, so nothing was exported');
  return JSON.parse(call[1]) as ExportedPayload;
};

describe('Evaluation session after the retention phase was removed', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(download).mockClear();
  });

  it('exports no retention key', async () => {
    const payload = await runSessionToExport();

    // The payload used to carry a top-level `retention` block alongside the tasks. It restated
    // one task's fields at the top level — and, because it read `appliedTask`, it restated the
    // wrong task's question. An analysis reading both would count retention twice.
    expect(payload).not.toHaveProperty('retention');
    expect(Object.keys(payload)).not.toContain('retention');
  });

  it('carries the retention task inside session.tasks', async () => {
    const payload = await runSessionToExport();

    const retention = payload.session.tasks.filter((t) => t.kind === 'retention');
    expect(retention).toHaveLength(1);
    expect(retention[0].id).toBe(3);
    // Its own answer, not the applied task's. The defect being fixed was that the phase rendered
    // appliedTask.description, so the participant answered the applied question twice and the
    // retention question never.
    expect(retention[0].answer).toBe('answer for retention');
  });

  it('goes from tasks straight to NASA-TLX, with no retention screen between', async () => {
    const user = userEvent.setup();
    await beginSession(user);
    await completeAllTasks(user, { withAnswers: false });

    expect(screen.queryByText(/Retention check/i)).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Continue to NASA-TLX' }));
    expect(screen.getByText(/NASA-TLX workload/)).toBeInTheDocument();
  });
});
