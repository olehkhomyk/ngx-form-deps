import { describe, expect, it } from 'vitest';

import { isNil, isEmpty, deepEqual } from '../src/utils/object.utils';

describe('isNil', () => {
	it('returns true for null', () => {
		expect(isNil(null)).toBe(true);
	});

	it('returns true for undefined', () => {
		expect(isNil(undefined)).toBe(true);
	});

	it('returns false for 0', () => {
		expect(isNil(0)).toBe(false);
	});

	it('returns false for empty string', () => {
		expect(isNil('')).toBe(false);
	});

	it('returns false for false', () => {
		expect(isNil(false)).toBe(false);
	});
});

describe('isEmpty', () => {
	it('returns true for undefined', () => {
		expect(isEmpty(undefined)).toBe(true);
	});

	it('returns true for null', () => {
		expect(isEmpty(null)).toBe(true);
	});

	it('returns true for empty object', () => {
		expect(isEmpty({})).toBe(true);
	});

	it('returns false when object has at least one key', () => {
		expect(isEmpty({ valueToMatch: 'x' })).toBe(false);
	});
});

describe('deepEqual', () => {
	it('returns true for identical primitives', () => {
		expect(deepEqual(1, 1)).toBe(true);
		expect(deepEqual('a', 'a')).toBe(true);
		expect(deepEqual(true, true)).toBe(true);
	});

	it('returns false for different primitives', () => {
		expect(deepEqual(1, 2)).toBe(false);
		expect(deepEqual('a', 'b')).toBe(false);
	});

	it('returns true for equal flat objects', () => {
		expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
	});

	it('returns false when objects have different values', () => {
		expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false);
	});

	it('returns false when objects have different keys', () => {
		expect(deepEqual({ a: 1 }, { b: 1 })).toBe(false);
	});

	it('returns false when one object has extra keys', () => {
		expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
	});

	it('returns true for equal nested objects', () => {
		expect(deepEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true);
	});

	it('returns false for different nested objects', () => {
		expect(deepEqual({ a: { b: 1 } }, { a: { b: 2 } })).toBe(false);
	});

	it('returns true for equal arrays', () => {
		expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
	});

	it('returns false for arrays with different values', () => {
		expect(deepEqual([1, 2], [1, 3])).toBe(false);
	});

	it('returns false for arrays of different length', () => {
		expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
	});

	it('returns false when comparing array to object', () => {
		expect(deepEqual([1], { 0: 1 })).toBe(false);
	});

	it('returns false when one side is null', () => {
		expect(deepEqual(null, { a: 1 })).toBe(false);
		expect(deepEqual({ a: 1 }, null)).toBe(false);
	});
});
