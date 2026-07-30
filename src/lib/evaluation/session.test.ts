import { describe, it, expect } from 'vitest';
import {
  susScore, tlxScore, sessionToCsv, tasksFromGroundTruth, canBeginTasks, DEMO_ANSWER_KEY,
} from './session';
import type { StudySession, TlxRatings } from './session';

const TLX_NEUTRAL: TlxRatings = {
  mental: 50, physical: 50, temporal: 50, performance: 50, effort: 50, frustration: 50,
};

function sessionWith(overrides: Partial<StudySession> = {}): StudySession {
  return {
    participantId: 'P01',
    condition: 'tool',
    conditionOrder: 'tool-first',
    repository: 'repoA',
    startedAtIso: '2026-07-27T10:00:00.000Z',
    tasks: [],
    sus: Object.fromEntries(Array.from({ length: 10 }, (_, i) => [i, 3])),
    tlx: TLX_NEUTRAL,
    notes: '',
    ...overrides,
  } as StudySession;
}

function taskWith(overrides: Record<string, unknown> = {}) {
  return {
    id: 1, kind: 'locating', name: 'Find the entry point', description: 'd',
    expectedFiles: [], answerKey: 'src/main.tsx', seededInaccurate: false,
    seededAnswerShown: undefined, status: 'completed',
    startTimeIso: '2026-07-27T10:00:00.000Z', completionTimeIso: '2026-07-27T10:01:00.000Z',
    elapsedSeconds: 60, answer: 'src/main.tsx', confidence: 4, isCorrect: true,
    errorDetected: null, ...overrides,
  };
}

describe('susScore (Brooke 1996)', () => {
  it('scores the all-optimal response pattern as 100', () => {
    // Odd items are positively worded (best = 5), even items negatively worded (best = 1).
    expect(susScore({ ...[5, 1, 5, 1, 5, 1, 5, 1, 5, 1] })).toBe(100);
  });

  it('scores a uniformly neutral response as 50', () => {
    expect(susScore({ ...Array(10).fill(3) })).toBe(50);
  });

  it('scores the all-worst response pattern as 0', () => {
    expect(susScore({ ...[1, 5, 1, 5, 1, 5, 1, 5, 1, 5] })).toBe(0);
  });
});

describe('tlxScore (Raw TLX, unweighted mean)', () => {
  it('averages the six subscales', () => {
    expect(tlxScore(TLX_NEUTRAL)).toBe(50);
    expect(tlxScore({ ...TLX_NEUTRAL, mental: 80, frustration: 40 })).toBeCloseTo(53.33, 1);
  });

  it('handles the extremes', () => {
    const zero = { mental: 0, physical: 0, temporal: 0, performance: 0, effort: 0, frustration: 0 };
    expect(tlxScore(zero)).toBe(0);
  });
});

describe('tasksFromGroundTruth', () => {
  it('leaves errorDetected unset so an unadministered probe is not exported as a negative', () => {
    const tasks = tasksFromGroundTruth({
      repository: 'repoA',
      tasks: [
        { id: 1, kind: 'locating', name: 'a', description: 'd', answerKey: 'k' },
        { id: 2, kind: 'applied', name: 'b', description: 'd', answerKey: 'k', seededInaccurate: true },
      ],
    } as never);

    expect(tasks[0].errorDetected).toBeNull();
    // Seeded tasks previously defaulted to false, which is indistinguishable in the export
    // from a participant who was asked and failed to notice the error.
    expect(tasks[1].errorDetected).toBeNull();
  });
});

describe('canBeginTasks', () => {
  const importedKey = tasksFromGroundTruth({
    repository: 'repoA',
    tasks: [{ id: 1, kind: 'locating', name: 'Find the entry point', description: 'd', answerKey: 'src/main.tsx' }],
  } as never);

  it('blocks the demo task set, whose answer keys are placeholders', () => {
    // The runner loads these by default, so without the guard a session could be run and
    // exported end to end with every answer scored against a demonstration key.
    expect(canBeginTasks('P01', tasksFromGroundTruth(DEMO_ANSWER_KEY))).toBe(false);
  });

  it('blocks a session with no participant identifier to file the export under', () => {
    expect(canBeginTasks('', importedKey)).toBe(false);
    expect(canBeginTasks('   ', importedKey)).toBe(false);
  });

  it('allows an identified participant once a real answer key is imported', () => {
    expect(canBeginTasks('P01', importedKey)).toBe(true);
    // An empty import is not a substitute for the demo set being replaced.
    expect(canBeginTasks('P01', [])).toBe(false);
  });
});

describe('sessionToCsv', () => {
  it('keeps elapsedSeconds numeric and free of summary values', () => {
    const csv = sessionToCsv(sessionWith({ tasks: [taskWith(), taskWith({ id: 2, elapsedSeconds: 90 })] as never }));
    const [head, ...rows] = csv.trim().split('\n');
    const cols = head.split(',');
    const idx = cols.indexOf('elapsedSeconds');

    expect(rows).toHaveLength(2);
    for (const row of rows) {
      expect(Number.isNaN(Number(row.split(',')[idx]))).toBe(false);
    }
  });

  it('repeats the session scores per row rather than appending a misaligned summary', () => {
    const csv = sessionToCsv(sessionWith({ tasks: [taskWith()] as never }));
    const cols = csv.split('\n')[0].split(',');
    expect(cols).toContain('susScore');
    expect(cols).toContain('tlxScore');
  });

  it('quotes answers containing commas, quotes and newlines', () => {
    const csv = sessionToCsv(sessionWith({
      tasks: [taskWith({ answer: 'it is in "main", then\nthe store' })] as never,
    }));
    expect(csv).toContain('"it is in ""main"", then\nthe store"');
  });

  it('neutralises answers that a spreadsheet would evaluate as a formula', () => {
    const csv = sessionToCsv(sessionWith({ tasks: [taskWith({ answer: '=SUM(A1:A2)' })] as never }));
    expect(csv).toContain("'=SUM(A1:A2)");
  });

  it('emits an empty cell for an unadministered error probe', () => {
    const csv = sessionToCsv(sessionWith({ tasks: [taskWith({ errorDetected: null })] as never }));
    const cols = csv.split('\n')[0].split(',');
    const row = csv.split('\n')[1].split(',');
    expect(row[cols.indexOf('errorDetected')]).toBe('');
  });
});
