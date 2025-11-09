import { useEffect } from "react";

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  callback: () => void;
}

/**
 * useKeyboardShortcuts Hook
 * Registers keyboard shortcuts and handles their callbacks
 * Supports Ctrl, Meta (Cmd), Shift, and Alt modifiers
 *
 * @param shortcuts - Array of shortcut configurations
 * @param enabled - Whether shortcuts are enabled (default: true)
 *
 * @example
 * useKeyboardShortcuts([
 *   {
 *     key: 'k',
 *     ctrl: true,
 *     meta: true,
 *     callback: () => console.log('Search')
 *   }
 * ]);
 */
export const useKeyboardShortcuts = (
  shortcuts: ShortcutConfig[],
  enabled: boolean = true
) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      shortcuts.forEach((shortcut) => {
        const keyMatches =
          event.key.toLowerCase() === shortcut.key.toLowerCase();

        const ctrlMatches =
          (shortcut.ctrl === true && event.ctrlKey) ||
          (shortcut.ctrl !== true);
        const metaMatches =
          (shortcut.meta === true && event.metaKey) ||
          (shortcut.meta !== true);
        const shiftMatches =
          (shortcut.shift === true && event.shiftKey) ||
          (shortcut.shift !== true);
        const altMatches =
          (shortcut.alt === true && event.altKey) || (shortcut.alt !== true);

        if (keyMatches && ctrlMatches && metaMatches && shiftMatches && altMatches) {
          event.preventDefault();
          shortcut.callback();
        }
      });
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [shortcuts, enabled]);
};

export default useKeyboardShortcuts;
