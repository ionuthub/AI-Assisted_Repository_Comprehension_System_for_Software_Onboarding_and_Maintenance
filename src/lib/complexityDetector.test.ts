import { describe, it, expect } from 'vitest';
import { detectLineComplexity } from './complexityDetector';

describe('detectLineComplexity', () => {
    it('should detect simple complexity for comments', () => {
        const result = detectLineComplexity('// This is a comment');
        expect(result.complexity).toBe('simple');
        expect(result.reason).toContain('Comment');
    });

    it('should detect medium complexity for if statements', () => {
        const result = detectLineComplexity('if (condition) {');
        expect(result.complexity).toBe('medium');
        expect(result.reason).toContain('Conditional');
    });

    it('should detect complex complexity for async functions', () => {
        const result = detectLineComplexity('async function fetchData() {');
        expect(result.complexity).toBe('complex');
        expect(result.reason).toContain('Asynchronous');
    });

    it('should detect complex complexity for ternary operators', () => {
        const result = detectLineComplexity('const x = condition ? a : b;');
        expect(result.complexity).toBe('complex');
        expect(result.reason).toContain('Ternary');
    });

    it('should handle empty lines as simple', () => {
        const result = detectLineComplexity('   ');
        expect(result.complexity).toBe('simple');
    });
});
