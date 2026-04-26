import { FormControl, Validators } from '@angular/forms';
import { describe, expect, it, vi } from 'vitest';

import { applyDependencies, DependencyType } from '../src';

describe('applyDependencies', () => {
	describe('CLEAR', () => {
		it('clears control when match is satisfied', () => {
			const control = new FormControl('hello');
			applyDependencies(true, [control], [{ type: DependencyType.CLEAR, match: { valueToMatch: true } }]);
			expect(control.value).toBeNull();
		});

		it('clears control when match is empty (always clear)', () => {
			const control = new FormControl('hello');
			applyDependencies('anything', [control], [{ type: DependencyType.CLEAR }]);
			expect(control.value).toBeNull();
		});

		it('does not clear when match is not satisfied', () => {
			const control = new FormControl('hello');
			applyDependencies(false, [control], [{ type: DependencyType.CLEAR, match: { valueToMatch: true } }]);
			expect(control.value).toBe('hello');
		});
	});

	describe('DISABLE', () => {
		it('disables control when match is satisfied', () => {
			const control = new FormControl('x');
			applyDependencies(true, [control], [{ type: DependencyType.DISABLE, match: { valueToMatch: true } }]);
			expect(control.disabled).toBe(true);
		});

		it('does not disable when match is not satisfied', () => {
			const control = new FormControl('x');
			applyDependencies(false, [control], [{ type: DependencyType.DISABLE, match: { valueToMatch: true } }]);
			expect(control.disabled).toBe(false);
		});
	});

	describe('ENABLE', () => {
		it('enables control when match is satisfied', () => {
			const control = new FormControl({ value: 'x', disabled: true });
			applyDependencies(true, [control], [{ type: DependencyType.ENABLE, match: { valueToMatch: true } }]);
			expect(control.enabled).toBe(true);
		});

		it('does not enable when match is not satisfied', () => {
			const control = new FormControl({ value: 'x', disabled: true });
			applyDependencies(false, [control], [{ type: DependencyType.ENABLE, match: { valueToMatch: true } }]);
			expect(control.enabled).toBe(false);
		});
	});

	describe('REQUIRED', () => {
		it('adds required when match is satisfied', () => {
			const control = new FormControl('');
			applyDependencies(true, [control], [{ type: DependencyType.REQUIRED, match: { valueToMatch: true } }]);
			expect(control.hasError('required')).toBe(true);
		});

		it('removes required when match is not satisfied', () => {
			const control = new FormControl('');
			applyDependencies(true, [control], [{ type: DependencyType.REQUIRED, match: { valueToMatch: true } }]);
			applyDependencies(false, [control], [{ type: DependencyType.REQUIRED, match: { valueToMatch: true } }]);
			expect(control.hasError('required')).toBe(false);
		});
	});

	describe('SET_VALUE', () => {
		it('patches control with literal valueToSet when match is satisfied', () => {
			const control = new FormControl('old');
			applyDependencies(true, [control], [{
				type: DependencyType.SET_VALUE,
				match: { valueToMatch: true, valueToSet: 'patched' }
			}]);
			expect(control.value).toBe('patched');
		});

		it('patches control with function valueToSet', () => {
			const control = new FormControl('old');
			applyDependencies('hello', [control], [{
				type: DependencyType.SET_VALUE,
				match: { ifValueExists: true, valueToSet: (v: string) => v.toUpperCase() }
			}]);
			expect(control.value).toBe('HELLO');
		});

		it('does not patch when match is not satisfied', () => {
			const control = new FormControl('old');
			applyDependencies(false, [control], [{
				type: DependencyType.SET_VALUE,
				match: { valueToMatch: true, valueToSet: 'patched' }
			}]);
			expect(control.value).toBe('old');
		});
	});

	describe('CUSTOM_VALIDATOR', () => {
		it('adds custom validator when match is satisfied', () => {
			const control = new FormControl('');
			applyDependencies(true, [control], [{
				type: DependencyType.CUSTOM_VALIDATOR,
				match: { valueToMatch: true },
				customValidators: [Validators.email]
			}]);
			expect(control.hasValidator(Validators.email)).toBe(true);
		});

		it('removes custom validator when match is not satisfied', () => {
			const control = new FormControl('');
			applyDependencies(true, [control], [{
				type: DependencyType.CUSTOM_VALIDATOR,
				match: { valueToMatch: true },
				customValidators: [Validators.email]
			}]);
			applyDependencies(false, [control], [{
				type: DependencyType.CUSTOM_VALIDATOR,
				match: { valueToMatch: true },
				customValidators: [Validators.email]
			}]);
			expect(control.hasValidator(Validators.email)).toBe(false);
		});

		it('does nothing when customValidators is empty', () => {
			const control = new FormControl('');
			expect(() => applyDependencies(true, [control], [{
				type: DependencyType.CUSTOM_VALIDATOR,
				match: { valueToMatch: true },
				customValidators: []
			}])).not.toThrow();
		});
	});

	describe('CUSTOM_HANDLER', () => {
		it('calls handler when match is satisfied', () => {
			const handler = vi.fn();
			applyDependencies('yes', [], [{
				type: DependencyType.CUSTOM_HANDLER,
				match: { valueToMatch: 'yes' },
				customHandler: handler
			}]);
			expect(handler).toHaveBeenCalledWith('yes');
		});

		it('does not call handler when match is not satisfied', () => {
			const handler = vi.fn();
			applyDependencies('no', [], [{
				type: DependencyType.CUSTOM_HANDLER,
				match: { valueToMatch: 'yes' },
				customHandler: handler
			}]);
			expect(handler).not.toHaveBeenCalled();
		});
	});

	describe('ON_CHANGE', () => {
		it('always calls handler regardless of value', () => {
			const handler = vi.fn();
			applyDependencies('anything', [], [{
				type: DependencyType.ON_CHANGE,
				customHandler: handler
			}]);
			expect(handler).toHaveBeenCalledWith('anything');
		});
	});

	describe('multiple dependencies', () => {
		it('applies all rules in order', () => {
			const control = new FormControl('');
			applyDependencies(true, [control], [
				{ type: DependencyType.REQUIRED, match: { valueToMatch: true } },
				{ type: DependencyType.DISABLE, match: { valueToMatch: true } }
			]);
			expect(control.hasValidator(Validators.required)).toBe(true);
			expect(control.disabled).toBe(true);
		});
	});
});
