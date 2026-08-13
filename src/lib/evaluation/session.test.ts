import { describe, it, expect } from 'vitest';
import {
  susScore, tlxScore, sessionToCsv, tasksFromGroundTruth, canBeginTasks, DEMO_ANSWER_KEY,
  EMPTY_TLX, isTlxComplete, isSusComplete, taskScore, taskMaxScore,
} from './session';
import type { StudySession, TlxRatings } from './session';

const TLX_NEUTRAL: TlxRatings = {
  mental: 50, physical: 50, temporal: 50, performance: 50, effort: 50, frustration: 50,
};

const SUS_ALL_NEUTRAL = Object.fromEntries(Array.from({ length: 10 }, (_, i) => [i, 3]));

function sessionWith(overrides: Partial<StudySession> = {}): StudySession {
  return {
    participantId: 'P01',
    condition: 'tool',
    conditionOrder: 'tool-first',
    repository: 'repoA',
    startedAtIso: '2026-07-27T10:00:00.000Z',
    tasks: [],
    sus: SUS_ALL_NEUTRAL,
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
    points: null, errorDetected: null, ...overrides,
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

  // These are the load-bearing ones. tsconfig sets strictNullChecks: false, so nothing in the
  // compiler prevents an unanswered item from being treated as a number, only this does.
  it('refuses to score an unanswered questionnaire rather than substituting the midpoint', () => {
    // The previous implementation read `ratings[i] ?? 3`, so ten unanswered items scored exactly
    // 50: a mid-scale usability result manufactured from no data, which would then have been
    // compared against the published benchmark of 68 as though a participant produced it.
    expect(susScore({})).toBeNull();
    expect(isSusComplete({})).toBe(false);
  });

  it('refuses to score a partially answered questionnaire', () => {
    const nineAnswered = Object.fromEntries(Array.from({ length: 9 }, (_, i) => [i, 4]));
    expect(isSusComplete(nineAnswered)).toBe(false);
    expect(susScore(nineAnswered)).toBeNull();

    // The tenth completes it, and only then is there a score.
    expect(susScore({ ...nineAnswered, 9: 4 })).not.toBeNull();
  });

  it('treats an explicit null the same as a missing item', () => {
    expect(susScore({ ...SUS_ALL_NEUTRAL, 4: null })).toBeNull();
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
    // 0 is a legitimate TLX rating, so it must survive as a score rather than reading as unset.
    expect(isTlxComplete(zero)).toBe(true);
  });

  it('refuses to score an untouched instrument rather than reporting the midpoint', () => {
    // Every subscale used to start at 50, so an unadministered TLX exported as a complete
    // instrument reading exactly 50 across all six.
    expect(tlxScore(EMPTY_TLX)).toBeNull();
    expect(isTlxComplete(EMPTY_TLX)).toBe(false);
  });

  it('refuses to score when a single subscale is unrecorded', () => {
    const fiveOfSix = { ...TLX_NEUTRAL, frustration: null };
    expect(isTlxComplete(fiveOfSix)).toBe(false);
    expect(tlxScore(fiveOfSix)).toBeNull();
    // Averaging the five that were answered would quietly change what the number means.
    expect(tlxScore({ ...fiveOfSix, frustration: 50 })).toBe(50);
  });
});

describe('taskScore, binary for locating, 0-2 for applied and retention', () => {
  it('scores locating tasks out of 1 from isCorrect', () => {
    expect(taskMaxScore('locating')).toBe(1);
    expect(taskScore({ kind: 'locating', isCorrect: true, points: null })).toBe(1);
    expect(taskScore({ kind: 'locating', isCorrect: false, points: null })).toBe(0);
  });

  it('scores applied and retention tasks out of 2 from points', () => {
    // The protocol, the answer keys and the marking rubric all commit to 0-2 for these kinds.
    // The runner offered only Correct/Incorrect, so an answer worth 1 of 2 had to be forced into
    // one or the other and half the rubric could not be recorded.
    for (const kind of ['applied', 'retention'] as const) {
      expect(taskMaxScore(kind)).toBe(2);
      expect(taskScore({ kind, isCorrect: null, points: 0 })).toBe(0);
      expect(taskScore({ kind, isCorrect: null, points: 1 })).toBe(1);
      expect(taskScore({ kind, isCorrect: null, points: 2 })).toBe(2);
    }
  });

  it('reports an unmarked task as null rather than as zero', () => {
    // Zero is a mark a participant can earn. Null is the absence of one, and conflating them
    // would silently convert every unmarked task into a failure.
    expect(taskScore({ kind: 'locating', isCorrect: null, points: null })).toBeNull();
    expect(taskScore({ kind: 'applied', isCorrect: null, points: null })).toBeNull();
    expect(taskScore({ kind: 'retention', isCorrect: null, points: null })).toBeNull();
  });

  it('ignores isCorrect on a 0-2 task, so a stale binary mark cannot leak into the score', () => {
    expect(taskScore({ kind: 'applied', isCorrect: true, points: null })).toBeNull();
    expect(taskScore({ kind: 'applied', isCorrect: true, points: 1 })).toBe(1);
  });
});

describe('tasksFromGroundTruth', () => {
  it('leaves confidence and both score fields unset, so nothing is invented before marking', () => {
    const [task] = tasksFromGroundTruth({
      repository: 'repoA',
      tasks: [{ id: 1, kind: 'applied', name: 'a', description: 'd', answerKey: 'k' }],
    } as never);

    // confidence defaulted to 3. It feeds the confidence-accuracy gap, and an invented 3 pulls
    // that gap toward zero, the direction that understates over-trust.
    expect(task.confidence).toBeNull();
    expect(task.isCorrect).toBeNull();
    expect(task.points).toBeNull();
  });

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
    expect(canBeginTasks('P01', tasksFromGroundTruth(DEMO_ANSWER_KEY), 'tool')).toBe(false);
  });

  it('blocks a session with no participant identifier to file the export under', () => {
    expect(canBeginTasks('', importedKey, 'tool')).toBe(false);
    expect(canBeginTasks('   ', importedKey, 'tool')).toBe(false);
  });

  it('blocks a session whose condition nobody chose', () => {
    // The runner defaulted to "tool", so a session intended as the manual half ran and exported
    // as a tool session unless someone noticed. It has happened twice in pilots, and it leaves
    // no trace: the export records the setting, not what the participant actually did.
    expect(canBeginTasks('P01', importedKey, null)).toBe(false);
    expect(canBeginTasks('P01', importedKey, 'manual')).toBe(true);
  });

  it('allows an identified participant once a real answer key is imported', () => {
    expect(canBeginTasks('P01', importedKey, 'tool')).toBe(true);
    // An empty import is not a substitute for the demo set being replaced.
    expect(canBeginTasks('P01', [], 'tool')).toBe(false);
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

  it('emits empty cells for unrecorded confidence and marks, never a substituted default', () => {
    const csv = sessionToCsv(sessionWith({
      tasks: [taskWith({ kind: 'applied', confidence: null, isCorrect: null, points: null })] as never,
    }));
    const cols = csv.split('\n')[0].split(',');
    const row = csv.split('\n')[1].split(',');

    // An empty cell loads as NA and forces a decision. A fabricated 3 loads as data.
    expect(row[cols.indexOf('confidence')]).toBe('');
    expect(row[cols.indexOf('isCorrect')]).toBe('');
    expect(row[cols.indexOf('points')]).toBe('');
    expect(row[cols.indexOf('score')]).toBe('');
    expect(row[cols.indexOf('maxScore')]).toBe('2');
  });

  it('emits empty score cells when an instrument was never completed', () => {
    const csv = sessionToCsv(sessionWith({ tasks: [taskWith()] as never, sus: {}, tlx: EMPTY_TLX }));
    const cols = csv.split('\n')[0].split(',');
    const row = csv.split('\n')[1].split(',');
    expect(row[cols.indexOf('susScore')]).toBe('');
    expect(row[cols.indexOf('tlxScore')]).toBe('');
  });

  it('carries the derived score and its denominator per row', () => {
    const csv = sessionToCsv(sessionWith({
      tasks: [
        taskWith({ id: 1, kind: 'locating', isCorrect: true }),
        taskWith({ id: 2, kind: 'applied', isCorrect: null, points: 1 }),
        taskWith({ id: 3, kind: 'retention', isCorrect: null, points: 2 }),
      ] as never,
    }));
    const cols = csv.split('\n')[0].split(',');
    const rows = csv.trim().split('\n').slice(1).map((r) => r.split(','));
    const score = (r: string[]) => [r[cols.indexOf('score')], r[cols.indexOf('maxScore')]];

    // Without maxScore in the file, a reader summing `score` across kinds would treat a
    // locating point and an applied point as the same unit.
    expect(score(rows[0])).toEqual(['1', '1']);
    expect(score(rows[1])).toEqual(['1', '2']);
    expect(score(rows[2])).toEqual(['2', '2']);
  });
});
