import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Keep the real session logic and mock only the download side effect.
vi.mock('@/lib/evaluation/session', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/evaluation/session')>()),
  download: vi.fn(),
}));

import EvaluationPage from './Evaluation';
import AnswerBody from '@/components/AnswerBody';
import { download, type GroundTruthFile } from '@/lib/evaluation/session';

// Example seeded answer with the same structure as a live answer.
const SEEDED_ANSWER = [
  'Based on the provided codebase, eligibility is evaluated by calling `checkEligibility`.',
  '',
  '**1. Nightly Batch Reverification**',
  '',
  'There are exactly **two** places where this check is executed:',
  '',
  '* `src/jobs/nightlyReverification.ts` (lines 17-20)',
  '* `src/triage/validation.ts` (lines 11-13)',
].join('\n');

// Mirrors the four-task shape used by the study answer keys.
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
      kind: 'locating',
      name: 'Everywhere eligibility is checked (SEEDED)',
      description: 'Find every place eligibility is checked. Test files do not count.',
      expectedFiles: ['src/triage/eligibility.ts'],
      answerKey: 'Three production sites.',
      seededInaccurate: true,
      seededAnswerShown: SEEDED_ANSWER,
    },
    {
      id: 3,
      kind: 'applied',
      name: 'Plan a new referral type',
      description: 'Where would a new referral type be added, and what else would change?',
      expectedFiles: [],
      answerKey: 'Route registry plus the policy and threshold config.',
    },
    {
      id: 4,
      kind: 'retention',
      name: 'Retention, from memory, tool closed',
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

type ExportedTask = {
  id: number;
  kind: string;
  answer: string;
  confidence: number | null;
  isCorrect: boolean | null;
  points: number | null;
};

type ExportedPayload = {
  session: { tasks: ExportedTask[]; tlx: Record<string, number | null> };
  scores: { sus: number | null; tlxRaw: number | null };
  instrumentsComplete: { sus: boolean; tlx: boolean };
};

const beginSession = async (
  user: ReturnType<typeof userEvent.setup>,
  condition: 'Manual' | 'Tool' = 'Tool'
) => {
  render(<EvaluationPage />);
  await user.type(screen.getByLabelText('Participant ID'), 'P01');
  await user.click(screen.getByRole('button', { name: condition }));

  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  await user.upload(fileInput, keyFile());

  // Wait for FileReader to replace the demo task set.
  const begin = screen.getByRole('button', { name: 'Begin tasks' });
  await waitFor(() => expect(begin).toBeEnabled());
  await user.click(begin);
};

const completeAllTasks = async (
  user: ReturnType<typeof userEvent.setup>,
  { withAnswers = true } = {}
) => {
  for (const task of ANSWER_KEY.tasks) {
    await user.click(screen.getAllByRole('button', { name: 'Start' })[0]);
    if (withAnswers) {
      await user.type(
        screen.getByPlaceholderText("Participant's answer..."),
        `answer for ${task.kind}`
      );
    }
    await user.click(screen.getByRole('button', { name: 'Complete task' }));
  }
};

const completeInstruments = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: /Continue to NASA-TLX/ }));
  for (const thumb of screen.getAllByRole('slider')) {
    thumb.focus();
    await user.keyboard('{ArrowRight}');
  }
  await user.click(screen.getByRole('button', { name: /Continue to SUS/ }));
  for (const button of screen.getAllByRole('button', { name: '3' })) {
    await user.click(button);
  }
  await user.click(screen.getByRole('button', { name: /Review and export/ }));
};

const runSessionToExport = async (
  opts: { markTasks?: boolean } = {}
): Promise<ExportedPayload> => {
  const user = userEvent.setup();
  await beginSession(user);
  await completeAllTasks(user);
  if (opts.markTasks) await markAllTasks(user);
  await completeInstruments(user);
  await user.click(screen.getByRole('button', { name: 'Export JSON' }));

  const call = vi.mocked(download).mock.calls.at(-1);
  if (!call) throw new Error('download was never called, so nothing was exported');
  return JSON.parse(call[1]) as ExportedPayload;
};

const markAllTasks = async (user: ReturnType<typeof userEvent.setup>) => {
  for (const button of screen.getAllByRole('button', { name: 'Correct' })) {
    await user.click(button);
  }
  for (const button of screen.getAllByRole('button', { name: '2' })) {
    await user.click(button);
  }
};

describe('Evaluation session after the retention phase was removed', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(download).mockClear();
  });

  it('exports no retention key', async () => {
    const payload = await runSessionToExport();

    expect(payload).not.toHaveProperty('retention');
    expect(Object.keys(payload)).not.toContain('retention');
  });

  it('carries the retention task inside session.tasks', async () => {
    const payload = await runSessionToExport();

    const retention = payload.session.tasks.filter((t) => t.kind === 'retention');
    expect(retention).toHaveLength(1);
    expect(retention[0].id).toBe(4);
    expect(retention[0].answer).toBe('answer for retention');
  });

  it('goes from tasks straight to NASA-TLX, with no retention screen between', async () => {
    const user = userEvent.setup();
    await beginSession(user);
    await completeAllTasks(user, { withAnswers: false });

    expect(screen.queryByText(/Retention check/i)).toBeNull();
    await user.click(screen.getByRole('button', { name: /Continue to NASA-TLX/ }));
    expect(screen.getByText(/NASA-TLX workload/)).toBeInTheDocument();
  });
});

describe('Unrecorded responses are exported as unrecorded, not as defaults', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(download).mockClear();
  });

  it('will not leave the TLX phase until every subscale has been operated', async () => {
    const user = userEvent.setup();
    await beginSession(user);
    await completeAllTasks(user);
    await user.click(screen.getByRole('button', { name: /Continue to NASA-TLX/ }));

    expect(screen.getAllByText('not recorded')).toHaveLength(6);
    const advance = screen.getByRole('button', { name: /Continue to SUS/ });
    expect(advance).toBeDisabled();
    expect(advance).toHaveTextContent('6 scale(s) not recorded');

    const thumbs = screen.getAllByRole('slider');
    for (const thumb of thumbs.slice(0, 5)) {
      thumb.focus();
      await user.keyboard('{ArrowRight}');
    }
    expect(screen.getByRole('button', { name: /Continue to SUS/ })).toBeDisabled();

    thumbs[5].focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Continue to SUS' })).toBeEnabled();
  });

  it('will not leave the SUS phase until all ten items are answered', async () => {
    const user = userEvent.setup();
    await beginSession(user);
    await completeAllTasks(user);
    await user.click(screen.getByRole('button', { name: /Continue to NASA-TLX/ }));
    for (const thumb of screen.getAllByRole('slider')) {
      thumb.focus();
      await user.keyboard('{ArrowRight}');
    }
    await user.click(screen.getByRole('button', { name: /Continue to SUS/ }));

    const advance = screen.getByRole('button', { name: /Review and export/ });
    expect(advance).toBeDisabled();
    expect(advance).toHaveTextContent('10 item(s) unanswered');

    const threes = screen.getAllByRole('button', { name: '3' });
    for (const button of threes.slice(0, 9)) await user.click(button);
    expect(screen.getByRole('button', { name: /Review and export/ })).toBeDisabled();

    await user.click(threes[9]);
    expect(screen.getByRole('button', { name: 'Review and export' })).toBeEnabled();
  });

  it('exports null confidence and null marks for a task the observer never scored', async () => {
    const payload = await runSessionToExport();

    for (const task of payload.session.tasks) {
      expect(task.confidence).toBeNull();
      expect(task.isCorrect).toBeNull();
      expect(task.points).toBeNull();
    }
    expect(payload.instrumentsComplete).toEqual({ sus: true, tlx: true });
    expect(payload.scores.sus).not.toBeNull();
    expect(payload.scores.tlxRaw).not.toBeNull();
  });
});

describe('Rubric scoring: binary for locating, 0-2 for applied and retention', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(download).mockClear();
  });

  it('offers Correct/Incorrect for locating tasks and a 0-2 rubric for the others', async () => {
    const user = userEvent.setup();
    await beginSession(user);
    await completeAllTasks(user);

    expect(screen.getAllByRole('button', { name: 'Correct' })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: 'Incorrect' })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: '0' })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: '2' })).toHaveLength(2);
  });

  it('records points on applied and retention tasks and isCorrect on locating ones', async () => {
    const payload = await runSessionToExport({ markTasks: true });
    const byId = Object.fromEntries(payload.session.tasks.map((t) => [t.id, t]));

    expect(byId[1].isCorrect).toBe(true);
    expect(byId[1].points).toBeNull();
    expect(byId[2].isCorrect).toBe(true);
    expect(byId[3].kind).toBe('applied');
    expect(byId[3].points).toBe(2);
    expect(byId[4].kind).toBe('retention');
    expect(byId[4].points).toBe(2);
  });
});

describe('The seeded answer is laid out like a live one', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(download).mockClear();
  });

  it('renders the seeded answer through the same component as the workspace Answers tab', async () => {
    const live = render(<AnswerBody content={SEEDED_ANSWER} />);
    const expectedMarkup = live.container.innerHTML;
    live.unmount();
    expect(expectedMarkup).toContain('<p class="text-body');
    expect(expectedMarkup).toContain('<li class="ml-5 list-disc');

    const user = userEvent.setup();
    await beginSession(user, 'Tool');
    await user.click(screen.getAllByRole('button', { name: 'Start' })[0]);
    await user.click(screen.getByRole('button', { name: 'Complete task' }));
    await user.click(screen.getAllByRole('button', { name: 'Start' })[0]);

    expect(document.body.innerHTML).toContain(expectedMarkup);
  });

  it('does not render the answer as a single italic run', async () => {
    const user = userEvent.setup();
    await beginSession(user, 'Tool');
    await user.click(screen.getAllByRole('button', { name: 'Start' })[0]);
    await user.click(screen.getByRole('button', { name: 'Complete task' }));
    await user.click(screen.getAllByRole('button', { name: 'Start' })[0]);

    expect(document.querySelector('p.italic')).toBeNull();
    expect(document.querySelectorAll('p.text-body').length).toBeGreaterThan(1);
  });
});

describe('The running condition is on screen', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(download).mockClear();
  });

  it('will not begin until a condition has been chosen', async () => {
    const user = userEvent.setup();
    render(<EvaluationPage />);

    await user.type(screen.getByLabelText('Participant ID'), 'P01');
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, keyFile());

    const begin = screen.getByRole('button', { name: 'Begin tasks' });
    await waitFor(() => expect(screen.getByText('Required')).toBeInTheDocument());
    expect(begin).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Manual' }));
    expect(begin).toBeEnabled();
    expect(screen.queryByText('Required')).toBeNull();
    expect(screen.getByText('Selected')).toBeInTheDocument();
  });

  it('shows nothing during setup, then an instruction once the session starts', async () => {
    const user = userEvent.setup();
    render(<EvaluationPage />);
    expect(screen.queryByRole('status')).toBeNull();

    await user.type(screen.getByLabelText('Participant ID'), 'P01');
    await user.click(screen.getByRole('button', { name: 'Manual' }));
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, keyFile());
    const begin = screen.getByRole('button', { name: 'Begin tasks' });
    await waitFor(() => expect(begin).toBeEnabled());
    await user.click(begin);

    expect(screen.getByRole('status')).toHaveTextContent('Condition: Manual. Do not use the tool.');
  });

  it('names the tool condition without a prohibition, and stays up through the questionnaires', async () => {
    const user = userEvent.setup();
    await beginSession(user);
    expect(screen.getByRole('status')).toHaveTextContent('Condition: Tool');
    expect(screen.getByRole('status')).not.toHaveTextContent('Do not use the tool');

    await completeAllTasks(user);
    await user.click(screen.getByRole('button', { name: /Continue to NASA-TLX/ }));
    expect(screen.getByRole('status')).toHaveTextContent('Condition: Tool');
  });
});
