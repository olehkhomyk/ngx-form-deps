import { describe, expect, it } from 'vitest';

import { shouldPerformAction } from '../src';

describe('shouldPerformAction', () => {
	describe('empty match', () => {
		it('returns false for undefined match', () => {
			expect(shouldPerformAction('x', undefined)).toBe(false);
		});

		it('returns false for empty match object', () => {
			expect(shouldPerformAction('x', {})).toBe(false);
		});
	});

	describe('ifValueExists', () => {
		it('returns true when value is truthy', () => {
			expect(shouldPerformAction('hello', { ifValueExists: true })).toBe(true);
		});

		it('returns false when value is empty string', () => {
			expect(shouldPerformAction('', { ifValueExists: true })).toBe(false);
		});

		it('returns false when value is null', () => {
			expect(shouldPerformAction(null, { ifValueExists: true })).toBe(false);
		});
	});

	describe('ifValueNotExists', () => {
		it('returns true when value is null', () => {
			expect(shouldPerformAction(null, { ifValueNotExists: true })).toBe(true);
		});

		it('returns true when value is empty string', () => {
			expect(shouldPerformAction('', { ifValueNotExists: true })).toBe(true);
		});

		it('returns false when value is truthy', () => {
			expect(shouldPerformAction('hello', { ifValueNotExists: true })).toBe(false);
		});
	});

	describe('valueToMatch', () => {
		it('returns true when value deeply equals valueToMatch', () => {
			expect(shouldPerformAction('yes', { valueToMatch: 'yes' })).toBe(true);
		});

		it('returns false when value does not match', () => {
			expect(shouldPerformAction('no', { valueToMatch: 'yes' })).toBe(false);
		});

		it('works with objects', () => {
			expect(shouldPerformAction({ a: 1 }, { valueToMatch: { a: 1 } })).toBe(true);
		});
	});

	describe('valueNotMatch', () => {
		it('returns true when value does not equal valueNotMatch', () => {
			expect(shouldPerformAction('a', { valueNotMatch: 'b' })).toBe(true);
		});

		it('returns false when value equals valueNotMatch', () => {
			expect(shouldPerformAction('a', { valueNotMatch: 'a' })).toBe(false);
		});
	});

	describe('condition', () => {
		it('returns true when condition returns true', () => {
			expect(shouldPerformAction(5, { condition: v => v > 3 })).toBe(true);
		});

		it('returns false when condition returns false', () => {
			expect(shouldPerformAction(1, { condition: v => v > 3 })).toBe(false);
		});
	});
});