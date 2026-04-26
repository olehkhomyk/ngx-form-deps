export function isNil(value: unknown): boolean {
	return value == null || typeof value === 'undefined';
}

export function isEmpty(value: object | null | undefined): boolean {
	return value == null || Object.keys(value).length === 0;
}

export function deepEqual(a: unknown, b: unknown): boolean {
	if (Object.is(a, b)) return true;
	if (a == null || b == null) return false;
	if (typeof a !== 'object' || typeof b !== 'object') return false;

	const aIsArray = Array.isArray(a);
	if (aIsArray !== Array.isArray(b)) return false;

	if (aIsArray) {
		const arrA = a as unknown[];
		const arrB = b as unknown[];
		if (arrA.length !== arrB.length) return false;
		for (let i = 0; i < arrA.length; i++) {
			if (!deepEqual(arrA[i], arrB[i])) return false;
		}
		return true;
	}

	const keysA = Object.keys(a as object);
	const keysB = Object.keys(b as object);
	if (keysA.length !== keysB.length) return false;
	const recordA = a as Record<string, unknown>;
	const recordB = b as Record<string, unknown>;
	for (const key of keysA) {
		if (!Object.prototype.hasOwnProperty.call(recordB, key)) return false;
		if (!deepEqual(recordA[key], recordB[key])) return false;
	}
	return true;
}
