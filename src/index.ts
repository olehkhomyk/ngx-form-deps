import { AbstractControl } from '@angular/forms';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { concat, Observable, of, pipe, Subscription } from 'rxjs';
import { distinctUntilChanged, tap } from 'rxjs/operators';
import { Dependency, DependencyHandlerOptions, Match } from './type/dependency.js';
import { DependencyType } from './enum/dependency.js';
import { defaultActionOptions } from './constant/default-dependencies.js';
import { deepEqual, isEmpty, isNil } from './utils/object.utils';
import {
	addControlsValidators, clearControls,
	disableControls,
	enableControls,
	patchControls,
	removeControlsValidators,
	setControlsRequired
} from "./helpers/control-actions";

export { DependencyType } from './enum/dependency.js';
export type { ActionOptions, Dependency, DependencyHandlerOptions, Match } from './type/dependency.js';
export {
	clearRule,
	clearOnFalseRule,
	disableWhenEmptyRule,
	enableWhenPresentRule,
	toggleByPresenceRules,
	toggleByBooleanRules,
	toggleByBooleanInverseRules,
	requiredRule,
	setValueRule,
	customHandlerRule,
	customValidatorRule,
	defaultActionOptions
} from './constant/default-dependencies.js';

export function shouldPerformAction<T>(controlValue: T, match: Match<T> | undefined): boolean {
	if (isEmpty(match) || isNil(match)) {
		return false;
	}

	return Boolean(
		(match!.ifValueExists && Boolean(controlValue)) ||
		(match!.ifValueNotExists && !controlValue) ||
		(!isNil(match!.valueToMatch) && deepEqual(match!.valueToMatch, controlValue)) ||
		(!isNil(match!.valueNotMatch) && !deepEqual(match!.valueNotMatch, controlValue)) ||
		(match!.condition != null && match!.condition(controlValue))
	);
}

function handleDependency<T>(
	controlValue: T,
	dependency: Dependency<T>,
	controls: AbstractControl[]
): void {
	const { type, match, customHandler, customValidators, actionOptions } = dependency;
	const performAction = shouldPerformAction(controlValue, match);

	switch (type) {
		case DependencyType.CLEAR:
			if (performAction || isEmpty(match)) {
				clearControls(controls, actionOptions);
			}
			break;
		case DependencyType.DISABLE:
			if (performAction) {
				disableControls(controls, actionOptions);
			}
			break;
		case DependencyType.ENABLE:
			if (performAction) {
				enableControls(controls, actionOptions);
			}
			break;
		case DependencyType.REQUIRED:
			setControlsRequired(controls, performAction, actionOptions);
			break;
		case DependencyType.SET_VALUE:
			if (performAction) {
				const valueToSet = match?.valueToSet;
				const resolved = typeof valueToSet === 'function'
					? (valueToSet as (value: T) => unknown)(controlValue)
					: valueToSet;
				patchControls(controls, resolved, actionOptions);
			}
			break;
		case DependencyType.CUSTOM_VALIDATOR: {
			if (!customValidators?.length) break;
			if (performAction) {
				addControlsValidators(controls, customValidators, actionOptions);
			} else {
				removeControlsValidators(controls, customValidators, actionOptions);
			}
			break;
		}
		case DependencyType.CUSTOM_HANDLER:
			if (performAction && typeof customHandler === 'function') {
				customHandler(controlValue);
			}
			break;
		case DependencyType.ON_CHANGE:
			// Side effect on every emission. No `match` needed — handler always fires.
			if (typeof customHandler === 'function') {
				customHandler(controlValue);
			}
			break;
		default:
			console.warn(`Unknown dependency type: ${type as string}`);
			break;
	}
}

/**
 * One-shot evaluation of a rule set against a single main-control
 * value. Every rule is evaluated in order and applied to the
 * `dependantControls`.
 *
 * Use this when you already have the main value in hand — e.g. inside
 * a template binding or a custom subscription — and do not want the
 * library to manage the `valueChanges` subscription for you. Reach
 * for {@link trackDependencies} instead when you want automatic
 * tracking.
 *
 * @typeParam T - Value type of the main control.
 * @param controlValue - Current value of the main control.
 * @param dependantControls - Controls the rules act on.
 * @param dependencies - Rules to evaluate.
 * @param options - Global options merged into each rule's action options.
 */
export function applyDependencies<T>(
	controlValue: T,
	dependantControls: AbstractControl[],
	dependencies: Dependency<T>[],
	options?: DependencyHandlerOptions<T>
): void {
	const prepared = prepareDependencies(controlValue, dependencies, options ?? {});
	for (const dependency of prepared) {
		handleDependency(controlValue, dependency, dependantControls);
	}
}

/**
 * Subscribes to a main control's value stream and re-evaluates a rule
 * set on every emission, applying the result to the dependant
 * controls.
 *
 * By default the rules are fired once immediately with the control's
 * current raw value, then again on every subsequent change. Pass
 * `options.startFromInitialValue = false` to wait for the first user
 * edit instead.
 *
 * The subscription is automatically torn down when the supplied
 * `DestroyRef` fires. The returned `Subscription` lets callers unsubscribe
 * earlier if needed.
 *
 * Both `dependantControls` and `dependencies` accept either a static
 * value or a function of the current main value, which is useful
 * when the set of affected controls or rules depends on the emitted
 * value itself.
 *
 * @typeParam T - Value type of the main control.
 * @param mainControl - Control whose value drives the rules.
 * @param dependantControls - Controls the rules act on, or a function producing them.
 * @param dependencies - Rules to evaluate, or a function producing them.
 * @param destroyRef - Lifecycle anchor used to tear down the subscription.
 * @param options - Options controlling initial emission, upstream piping, and default action options.
 * @returns Subscription for early manual teardown.
 */
export function trackDependencies<T>(
	mainControl: AbstractControl,
	dependantControls: AbstractControl[] | ((controlValue: T) => AbstractControl[]),
	dependencies: Dependency<T>[] | ((controlValue: T) => Dependency<T>[]),
	destroyRef: DestroyRef,
	options?: DependencyHandlerOptions<T>
): Subscription {
	const resolvedOptions: DependencyHandlerOptions<T> = options ?? {};
	const controlStream = getHandlerStream<T>(mainControl, resolvedOptions);
	const customPipe = resolvedOptions.customPipe ?? pipe();

	const rulePipe = pipe(
		distinctUntilChanged<T>(),
		tap((controlValue: T) => {
			const prepared = prepareDependencies(controlValue, dependencies, resolvedOptions);
			const targets = typeof dependantControls === 'function'
				? dependantControls(controlValue)
				: dependantControls;
			for (const dependency of prepared) {
				handleDependency(controlValue, dependency, targets);
			}
		}),
		takeUntilDestroyed(destroyRef)
	);

	return controlStream.pipe(customPipe, rulePipe).subscribe();
}

function getHandlerStream<T>(
	mainControl: AbstractControl,
	options?: DependencyHandlerOptions<T>
): Observable<T> {
	const startFromInitialValue = typeof options?.startFromInitialValue === 'boolean'
		? options.startFromInitialValue
		: true;

	const valueChanges = mainControl.valueChanges as Observable<T>;
	if (!startFromInitialValue) {
		return valueChanges;
	}

	const initialValue = mainControl.getRawValue() as T;
	return concat(of(initialValue), valueChanges);
}

function prepareDependencies<T>(
	controlValue: T,
	dependencies: Dependency<T>[] | ((controlValue: T) => Dependency<T>[]),
	options: DependencyHandlerOptions<T>
): Dependency<T>[] {
	const resolved = typeof dependencies === 'function'
		? dependencies(controlValue)
		: dependencies;

	return resolved.map(dependency => ({
		...dependency,
		actionOptions: {
			...defaultActionOptions,
			...(options.rootActionOptions ?? {}),
			...(dependency.actionOptions ?? {})
		}
	}));
}
