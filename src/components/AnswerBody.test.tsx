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
  it('adds no wrapper element', () => {
    const { container } = render(<AnswerBody content={ANSWER} />);
    const tags = Array.from(container.children).map((el) => el.tagName);
    expect(tags).not.toContain('DIV');
    expect(tags).toEqual(['H3', 'P', 'H4', 'LI', 'LI', 'P']);
  });

  it('renders headings, bullets and paragraphs', () => {
    const { container } = render(<AnswerBody content={ANSWER} />);
    expect(container.querySelector('h3')?.textContent).toBe('Mechanism of Action');
    expect(container.querySelector('h4')?.textContent).toBe('Key Types Involved');
    expect(container.querySelectorAll('li')).toHaveLength(2);
  });

  it('drops blank lines rather than emitting empty paragraphs', () => {
    const { container } = render(<AnswerBody content={'one\n\n\ntwo'} />);
    expect(container.querySelectorAll('p')).toHaveLength(2);
  });

  it('leaves inline bold markers unchanged inside paragraphs', () => {
    const { container } = render(<AnswerBody content={'There are exactly **two** places.'} />);
    expect(container.textContent).toContain('**two**');
  });
});
