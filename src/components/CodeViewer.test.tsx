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
