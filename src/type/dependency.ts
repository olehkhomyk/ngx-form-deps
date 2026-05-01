import { ValidatorFn } from '@angular/forms';
import { MonoTypeOperatorFunction } from 'rxjs';
import { DependencyType } from '../enum/dependency.js';

/**
 * A single rule describing what should happen to a set of dependant
 * controls in response to the value of a main control.
 *
 * A rule combines three pieces:
 *  - {@link type} — the action to run (see {@link DependencyType}).
 *  - {@link match} — the condition under which the action runs.
 *  - Payload for the action (validators, handler, action options).
 *
 * @typeParam T - Value type of the main control the rule is applied against.
 */
export interface Dependency<T = any> {
	/** Action performed when {@link match} is satisfied. */
	type: DependencyType;
	/** Predicate describing when the action should run. */
	match?: Match<T>;
	/** Validators used by `CUSTOM_VALIDATOR` rules. */
	customValidators?: ValidatorFn[];
	/** Side effect used by `CUSTOM_HANDLER` rules. */
	customHandler?: (value: T) => void;
	/** Per-rule override for the Angular form action options. */
	actionOptions?: ActionOptions;
}

/**
 * Predicate describing when a {@link Dependency} rule fires. The
 * fields are evaluated in a fixed order and the first truthy branch
 * wins:
 *
 *  1. `ifValueExists` — the main control's value is truthy.
 *  2. `ifValueNotExists` — the main control's value is falsy.
 *  3. `valueToMatch` — deep equality with the main control's value.
 *  4. `valueNotMatch` — deep inequality with the main control's value.
 *  5. `condition` — custom predicate on the main control's value.
 *
 * Leaving every field undefined yields a match that never fires —
 * except for {@link DependencyType.CLEAR}, where an empty match is
 * treated as "always clear" on every emission.
 *
 * @typeParam T - Value type of the main control.
 */
export interface Match<T = any> {
	/** Fires when the main control's value is truthy. */
	ifValueExists?: boolean;
	/** Fires when the main control's value is falsy. */
	ifValueNotExists?: boolean;
	/** Fires when the main control's value deeply equals this value. */
	valueToMatch?: T;
	/** Fires when the main control's value does not deeply equal this value. */
	valueNotMatch?: T;
	/**
	 * Value written by a `SET_VALUE` rule. May be a literal, or a
	 * function that derives the value from the main control's value.
	 */
	valueToSet?: ((controlValue: T) => unknown) | unknown;
	/** Fires when this predicate returns `true`. */
	condition?: (value: T) => boolean;
}

/**
 * Options for the reactive {@link trackDependencies} entry point.
 *
 * @typeParam T - Value type of the main control being tracked.
 */
export interface DependencyHandlerOptions<T = any> {
	/**
	 * When `true` (the default) the rules are evaluated once with the
	 * main control's current raw value before subscribing to
	 * `valueChanges`. Set to `false` to wait for the first user
	 * interaction instead.
	 */
	startFromInitialValue?: boolean;
	/**
	 * Extra RxJS operator applied upstream of the built-in pipeline.
	 * Use it to debounce, filter, or otherwise massage the main
	 * control's stream before rules evaluate. The operator must be
	 * type-preserving: `Observable<T> -> Observable<T>`.
	 */
	customPipe?: MonoTypeOperatorFunction<T>;
	/**
	 * Default {@link ActionOptions} applied to every rule in the set.
	 * Per-rule `actionOptions` still win over this value.
	 */
	rootActionOptions?: ActionOptions;
}

/**
 * Subset of the Angular form options accepted by `reset`, `enable`,
 * `disable`, `patchValue`, and `updateValueAndValidity`.
 */
export interface ActionOptions {
	/**
	 * Whether the control should emit value/status change events as a
	 * result of the action. Defaults to `false` in this library to
	 * prevent cascading updates between rules.
	 */
	emitEvent?: boolean;
}