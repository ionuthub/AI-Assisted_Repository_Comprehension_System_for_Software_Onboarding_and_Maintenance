import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import AnswerBody from './AnswerBody';

const ANSWER = [
  '### Mechanism of Action',
  '',
  'The registry maps a type to its handler.',
  '',
  '**Key Types Involved**',
  '',
  '* `ReferralType` from `../../types/domain`',
  '- `RouteHandler`, a function signature',
  '',
  'There are exactly **two** places where this happens.',
].join('\n');

describe('AnswerBody', () => {
  it('adds no element of its own, so the caller container holds the lines directly', () => {
    // analysis/capture_gate.mjs locates the answer with
    // `p:text-is("Your question") + h1 + div:not([aria-busy])` and reads innerText from it, and
    // the evidence panel is read with direct-child selectors. An extra wrapper here changes the
    // DOM the capture measures, which is a change to the instrument, not to its styling.
    const { container } = render(<AnswerBody content={ANSWER} />);
    const tags = Array.from(container.children).map((el) => el.tagName);
    expect(tags).not.toContain('DIV');
    expect(tags).toEqual(['H3', 'P', 'H4', 'LI', 'LI', 'P']);
  });

  it('applies the workspace rules: heading, bold-only line, bullets, paragraphs', () => {
    const { container } = render(<AnswerBody content={ANSWER} />);
    expect(container.querySelector('h3')?.textContent).toBe('Mechanism of Action');
    expect(container.querySelector('h4')?.textContent).toBe('Key Types Involved');
    expect(container.querySelectorAll('li')).toHaveLength(2);
    expect(container.querySelector('li')?.textContent).toBe('`ReferralType` from `../../types/domain`');
  });

  it('drops blank lines rather than emitting empty paragraphs', () => {
    const { container } = render(<AnswerBody content={'one\n\n\ntwo'} />);
    expect(container.querySelectorAll('p')).toHaveLength(2);
  });

  it('leaves inline bold as literal asterisks, exactly as the deployed tool does', () => {
    // Not a defect to fix here. The seeded over-trust probe shows a pre-recorded answer beside
    // live ones, and it must look the same as they do. Rendering inline markdown in one place
    // and not the other is what makes the planted answer identifiable.
    const { container } = render(<AnswerBody content={'There are exactly **two** places.'} />);
    expect(container.textContent).toContain('**two**');
  });
});
