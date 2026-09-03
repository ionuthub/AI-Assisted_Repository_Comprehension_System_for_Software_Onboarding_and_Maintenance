import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers as unknown as Parameters<typeof expect.extend>[0]);

// jsdom has no ResizeObserver; some Radix primitives require one when mounted in tests.
if (!('ResizeObserver' in globalThis)) {
    globalThis.ResizeObserver = class {
        observe() { }
        unobserve() { }
        disconnect() { }
    };
}

afterEach(() => {
    cleanup();
});
