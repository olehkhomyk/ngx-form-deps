import { DestroyRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DependencyType, trackDependencies, clearOnFalseRule, toggleByBooleanRules } from '../src';

describe('trackDependencies', () => {
	let destroyRef: DestroyRef;

	beforeEach(() => {
		destroyRef = TestBed.inject(DestroyRef);
	});

	describe('initial emission', () => {
		it('applies rules immediately with the current value by default', () => {
			const main = new FormControl(true);
			const dependant = new FormControl('');

			trackDependencies(main, [dependant], [
				{ type: DependencyType.REQUIRED, match: { valueToMatch: true } }
			], destroyRef);

			expect(dependant.hasError('required')).toBe(true);
		});

		it('skips initial emission when startFromInitialValue is false', () => {
			const main = new FormControl(true);
			const dependant = new FormControl('');

			trackDependencies(main, [dependant], [
				{ type: DependencyType.REQUIRED, match: { valueToMatch: true } }
			], destroyRef, { startFromInitialValue: false });

			expect(dependant.hasError('required')).toBe(false);
		});
	});

	describe('reacts to value changes', () => {
		it('re-evaluates rules when main control value changes', () => {
			const main = new FormControl(false);
			const dependant = new FormControl('');

			trackDependencies(main, [dependant], [
				{ type: DependencyType.REQUIRED, match: { valueToMatch: true } }
			], destroyRef);

			expect(dependant.hasError('required')).toBe(false);

			main.setValue(true);
			expect(dependant.hasError('required')).toBe(true);

			main.setValue(false);
			expect(dependant.hasError('required')).toBe(false);
		});

		it('does not re-evaluate when value does not change (distinctUntilChanged)', () => {
			const handler = vi.fn();
			const main = new FormControl('same');

			trackDependencies(main, [], [{
				type: DependencyType.CUSTOM_HANDLER,
				match: { ifValueExists: true },
				customHandler: handler
			}], destroyRef);

			// initial emission counts as one call
			main.setValue('same');
			main.setValue('same');

			expect(handler).toHaveBeenCalledTimes(1);
		});
	});

	describe('preset rules', () => {
		it('toggleByBooleanRules enables on true and disables on false', () => {
			const main = new FormControl(false);
			const dependant = new FormControl({ value: '', disabled: true });

			trackDependencies(main, [dependant], toggleByBooleanRules, destroyRef);

			expect(dependant.disabled).toBe(true);

			main.setValue(true);
			expect(dependant.enabled).toBe(true);

			main.setValue(false);
			expect(dependant.disabled).toBe(true);
		});

		it('clearOnFalseRule clears dependant when main becomes false', () => {
			const main = new FormControl<boolean>(true);
			const dependant = new FormControl('filled');

			trackDependencies(main, [dependant], [clearOnFalseRule], destroyRef);

			main.setValue(false);
			expect(dependant.value).toBeNull();
		});
	});

	describe('dynamic dependantControls', () => {
		it('resolves dependant controls from a function', () => {
			const main = new FormControl<'a' | 'b'>('a');
			const controlA = new FormControl('');
			const controlB = new FormControl('');

			trackDependencies(
				main,
				value => value === 'a' ? [controlA] : [controlB],
				[{ type: DependencyType.REQUIRED, match: { ifValueExists: true } }],
				destroyRef
			);

			expect(controlA.hasError('required')).toBe(true);
			expect(controlB.hasError('required')).toBe(false);

			main.setValue('b');
			expect(controlB.hasError('required')).toBe(true);
		});
	});

	describe('dynamic dependencies', () => {
		it('resolves different rules depending on current value', () => {
			const main = new FormControl<'a' | 'b'>('a');
			const dependant = new FormControl('');

			trackDependencies(
				main,
				[dependant],
				value => value === 'a'
					? [{ type: DependencyType.DISABLE, match: { ifValueExists: true } }]
					: [{ type: DependencyType.ENABLE, match: { ifValueExists: true } }],
				destroyRef
			);

			expect(dependant.disabled).toBe(true);

			main.setValue('b');
			expect(dependant.enabled).toBe(true);
		});
	});

	describe('customPipe option', () => {
		it('applies customPipe upstream', async () => {
			const handler = vi.fn();
			const main = new FormControl('');

			trackDependencies(main, [], [{
				type: DependencyType.CUSTOM_HANDLER,
				match: { ifValueExists: true },
				customHandler: handler
			}], destroyRef, { customPipe: debounceTime(50) });

			main.setValue('a');
			main.setValue('b');
			main.setValue('c');

			await new Promise(resolve => setTimeout(resolve, 100));

			// only the last emission passes through debounce
			expect(handler).toHaveBeenCalledTimes(1);
			expect(handler).toHaveBeenCalledWith('c');
		});
	});

	describe('manual unsubscribe', () => {
		it('stops reacting after subscription is unsubscribed', () => {
			const main = new FormControl(false);
			const dependant = new FormControl('');

			const sub = trackDependencies(main, [dependant], [
				{ type: DependencyType.REQUIRED, match: { valueToMatch: true } }
			], destroyRef);

			sub.unsubscribe();

			main.setValue(true);
			expect(dependant.hasError('required')).toBe(false);
		});
	});
});