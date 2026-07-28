import { describe, it, expect } from 'vitest';
import { SUGGESTED_QUESTIONS } from './SuggestedQuestions';

/**
 * Terms naming one of the seven planted architectural patterns, or a target of a timed task
 * or accuracy-gate item, in either study repository.
 *
 * A suggested question containing one of these would prompt participants in the assisted
 * condition towards a scored target before the task begins, and only in that condition. The
 * difference between conditions would then partly measure the prompt rather than the tool.
 */
const TASK_TARGET_TERMS =
  /\b(handler|registr\w*|config\w*|rules?|reserv\w*|stock|eligib\w*|api|requests?|intercept\w*|pipeline|validat\w*|checks?|legacy|pricing|slots?|events?|emit\w*|subscrib\w*|notif\w*|listen\w*|dispatch\w*|referrals?|orders?|zones?|clinic|warehouse|priorit\w*|safeguard\w*|hazard\w*|docks?|appointments?|shipments?)\b/i;

describe('SUGGESTED_QUESTIONS', () => {
  it('names no planted pattern or task target', () => {
    for (const question of SUGGESTED_QUESTIONS) {
      expect(TASK_TARGET_TERMS.test(question), `"${question}" names a task target`).toBe(false);
    }
  });

  it('uses no repository-specific vocabulary', () => {
    // The same three questions are shown for both study repositories. A term belonging to one
    // domain would retrieve well in one condition and not the other, which is the defect the
    // previous wording had.
    const domainTerms = /\b(order|referral|warehouse|clinic|patient|stock|shipment|triage)\w*\b/i;
    for (const question of SUGGESTED_QUESTIONS) {
      expect(domainTerms.test(question), `"${question}" is domain-specific`).toBe(false);
    }
  });

  it('offers exactly three questions, as the protocol records', () => {
    expect(SUGGESTED_QUESTIONS).toHaveLength(3);
  });

  it('asks distinct things', () => {
    // Three near-synonyms would waste the strip and give a participant no reason to pick one.
    expect(new Set(SUGGESTED_QUESTIONS).size).toBe(SUGGESTED_QUESTIONS.length);
  });
});
