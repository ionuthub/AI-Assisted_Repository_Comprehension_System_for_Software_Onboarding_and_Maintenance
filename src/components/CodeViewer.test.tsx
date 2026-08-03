import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CodeViewer from './CodeViewer';

const SOURCE = ['const a = 1;', 'const b = 2;', 'const c = 3;'].join('\n');

const renderViewer = () => {
  const onLineSelect = vi.fn();
  render(
    <CodeViewer
      isLoading={false}
      fileName="src/example.ts"
      fileContent={SOURCE}
      onLineSelect={onLineSelect}
      selectedLine={null}
      selectedLines={new Set()}
    />
  );
  return onLineSelect;
};

describe('CodeViewer line selection', () => {
  it('reports a plain click as a single-line selection', async () => {
    const user = userEvent.setup();
    const onLineSelect = renderViewer();

    await user.click(screen.getByText('const b = 2;'));

    expect(onLineSelect).toHaveBeenCalledWith(2, false);
  });

  // Regression: Index.tsx wrapped this callback in `(line) => handleLineSelect(line)`,
  // which declares one parameter and so discarded the modifier flag on every click.
  // Multi-select could never engage, contradicting the viewer's own on-screen
  // instruction. TypeScript does not catch it: a function taking fewer parameters is
  // structurally assignable to a callback type expecting more, so only an assertion on
  // the second argument closes this hole.
  it.each([['Control'], ['Meta'], ['Shift']])(
    'reports a %s+click as a multi-select',
    async (modifier) => {
      const user = userEvent.setup();
      const onLineSelect = renderViewer();

      await user.keyboard(`{${modifier}>}`);
      await user.click(screen.getByText('const c = 3;'));

      expect(onLineSelect).toHaveBeenCalledWith(3, true);
    }
  );

  it('numbers every line, including the empty one after a trailing newline', () => {
    render(
      <CodeViewer
        isLoading={false}
        fileName="src/example.ts"
        fileContent={'a\nb\n'}
        onLineSelect={vi.fn()}
        selectedLine={null}
        selectedLines={new Set()}
      />
    );

    expect(screen.getByText('3')).toBeInTheDocument();
  });
});

// Keyboard access: line selection was mouse-only until this pass. Each line was
// a div with an onClick and no tabIndex, role, or key handler — reachable by
// click, invisible to Tab. A keyboard-only user could not select a line, so
// could not use per-line questioning at all. Found by static accessibility
// review, not by any prior test, which is itself worth recording: none of
// typecheck, unit tests, or lint catch a missing keyboard path.
describe('CodeViewer keyboard access', () => {
  it('exposes exactly one tab stop into the line list', () => {
    renderViewer();
    const options = screen.getAllByRole('option');
    const tabbable = options.filter((el) => el.getAttribute('tabindex') === '0');
    // Not zero tab stops (unreachable) and not one per line (unusable on a long
    // file) — exactly one, moved by arrow keys once focus is inside.
    expect(tabbable).toHaveLength(1);
  });

  it('moves the tab stop with ArrowDown and ArrowUp', async () => {
    const user = userEvent.setup();
    renderViewer();
    const first = screen.getByText('const a = 1;').closest('[role="option"]') as HTMLElement;
    first.focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByText('const b = 2;').closest('[role="option"]')).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(first).toHaveFocus();
  });

  it('selects a single line on Enter', async () => {
    const onLineSelect = renderViewer();
    const line = screen.getByText('const b = 2;').closest('[role="option"]') as HTMLElement;
    line.focus();
    await userEvent.setup().keyboard('{Enter}');
    expect(onLineSelect).toHaveBeenCalledWith(2, false);
  });

  it('toggles a line into the selection on Space, mirroring modifier+click', async () => {
    const onLineSelect = renderViewer();
    const line = screen.getByText('const c = 3;').closest('[role="option"]') as HTMLElement;
    line.focus();
    await userEvent.setup().keyboard(' ');
    expect(onLineSelect).toHaveBeenCalledWith(3, true);
  });

  it('reports selection state to assistive tech via aria-selected', () => {
    const onLineSelect = vi.fn();
    render(
      <CodeViewer
        isLoading={false}
        fileName="src/example.ts"
        fileContent={SOURCE}
        onLineSelect={onLineSelect}
        selectedLine={2}
        selectedLines={new Set([2])}
      />
    );
    expect(screen.getByText('const b = 2;').closest('[role="option"]')).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByText('const a = 1;').closest('[role="option"]')).toHaveAttribute(
      'aria-selected',
      'false'
    );
  });
});
