import { describe, it, expect } from 'vitest';
import { detectCodeBlock } from './blockDetector';

const SOURCE = [
  'function alpha() {',      // 1
  '  doWork();',             // 2
  '}',                       // 3
  'const x = 1;',            // 4
  'class Beta {',            // 5
  '  method() {',            // 6
  '    return 1;',           // 7
  '  }',                     // 8
  '}',                       // 9
].join('\n');

describe('detectCodeBlock', () => {
  it('selects the whole function when the declaration line is clicked', () => {
    const block = detectCodeBlock(SOURCE, 1);
    expect(block.type).toBe('function');
    expect(block.startLine).toBe(1);
    expect(block.endLine).toBe(3);
  });

  it('selects the enclosing function from a line inside its body', () => {
    // Regression: the backward brace scan tested for a positive counter, so a line inside
    // a block never matched and fell through to a single-line selection.
    const block = detectCodeBlock(SOURCE, 2);
    expect(block.startLine).toBeLessThanOrEqual(2);
    expect(block.endLine).toBeGreaterThanOrEqual(2);
    expect(block.type).not.toBe('line');
  });

  it('does not select the preceding sibling block from a top-level line', () => {
    // Regression: the inverted sign matched the closing brace of the *previous* block,
    // so clicking an unrelated top-level statement highlighted the function above it.
    const block = detectCodeBlock(SOURCE, 4);
    expect(block.startLine).toBe(4);
    expect(block.endLine).toBe(4);
  });

  it('selects a class declaration as a class block', () => {
    const block = detectCodeBlock(SOURCE, 5);
    expect(block.type).toBe('class');
    expect(block.startLine).toBe(5);
    expect(block.endLine).toBe(9);
  });

  it('returns a valid range for an out-of-bounds line rather than throwing', () => {
    const block = detectCodeBlock(SOURCE, 999);
    expect(block.startLine).toBeGreaterThan(0);
    expect(block.endLine).toBeGreaterThanOrEqual(block.startLine);
  });

  it('handles an empty document', () => {
    const block = detectCodeBlock('', 1);
    expect(block).toBeTruthy();
    expect(block.endLine).toBeGreaterThanOrEqual(block.startLine);
  });
});
