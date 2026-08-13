import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extends Vitest's expect method with methods from react-testing-library
expect.extend(matchers as unknown as Parameters<typeof expect.extend>[0]);

// jsdom implements no ResizeObserver, and Radix primitives that measure themselves, Slider
// among them, throw on mount without it. That made the evaluation session runner untestable at
// the point it renders a confidence slider, which is not a reason to leave the runner untested.
// Sizes are reported as zero: nothing here asserts on layout, only on behaviour.
if (!('ResizeObserver' in globalThis)) {
    globalThis.ResizeObserver = class {
        observe() { }
        unobserve() { }
        disconnect() { }
    };
}

// Runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
    cleanup();
});
