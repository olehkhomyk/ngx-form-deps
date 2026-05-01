import { DependencyType } from '../enum/dependency.js';
import { ActionOptions, Dependency } from '../type/dependency.js';

/**
 * Clears the target controls on every emission of the main control,
 * regardless of the emitted value. Useful as a reset companion to
 * another rule that only conditionally changes state.
 */
export const clearRule: Dependency = {
	type: DependencyType.CLEAR
};

/**
 * Clears the target controls whenever the main control's value is
 * strictly `false`. Typical use: a checkbox toggling off a dependent
 * section.
 */
export const clearOnFalseRule: Dependency = {
	...clearRule,
	match: {
		valueToMatch: false
	}
};

/**
 * Disables the target controls while the main control's value is
 * falsy (`null`, `undefined`, `''`, `0`, `false`).
 */
export const disableWhenEmptyRule: Dependency = {
	type: DependencyType.DISABLE,
	match: {
		ifValueNotExists: true
	}
};

/**
 * Enables the target controls while the main control's value is
 * truthy.
 */
export const enableWhenPresentRule: Dependency = {
	type: DependencyType.ENABLE,
	match: {
		ifValueExists: true
	}
};

/**
 * Combined enable/disable based on the truthiness of the main
 * control's value. Enable when a value is present, disable when it
 * is not.
 */
export const toggleByPresenceRules: Dependency[] = [
	disableWhenEmptyRule,
	enableWhenPresentRule
];

/**
 * Enable when the main control's value is `true`, disable when
 * `false`. Intended for boolean main controls.
 */
export const toggleByBooleanRules: Dependency[] = [
	{
		...enableWhenPresentRule,
		match: { valueToMatch: true }
	},
	{
		...disableWhenEmptyRule,
		match: { valueToMatch: false }
	}
];

/**
 * Inverse of {@link toggleByBooleanRules}. Enable when the main
 * control's value is `false`, disable when `true`.
 */
export const toggleByBooleanInverseRules: Dependency[] = [
	{
		...enableWhenPresentRule,
		match: { valueToMatch: false }
	},
	{
		...disableWhenEmptyRule,
		match: { valueToMatch: true }
	}
];

/**
 * Marker rule for toggling `Validators.required` on the target
 * controls. Supply a `match` to control when `required` is applied;
 * without a match the validator is always removed.
 */
export const requiredRule: Dependency = {
	type: DependencyType.REQUIRED
};

/**
 * Marker rule for writing a value into the target controls. Pair
 * with a `match` that provides `valueToSet`, either as a literal
 * value or a function of the main control's value.
 */
export const setValueRule: Dependency = {
	type: DependencyType.SET_VALUE
};

/**
 * Marker rule for running a side effect callback when the match
 * passes. The callback receives the main control's current value.
 */
export const customHandlerRule: Dependency = {
	type: DependencyType.CUSTOM_HANDLER
};

/**
 * Marker rule for running a side effect callback on every emission
 * of the main control, regardless of any `match`. Useful when the
 * callback itself decides what to do with the value (logging,
 * analytics, syncing to external state).
 */
export const onChangeRule: Dependency = {
	type: DependencyType.ON_CHANGE
};

/**
 * Default action options used when no override is provided. Suppresses
 * the value/status change event emission so rule chains do not cause
 * cascading `valueChanges` updates.
 */
export const defaultActionOptions: ActionOptions = { emitEvent: false };

/**
 * Marker rule for attaching user-supplied validators.
 *
 * IMPORTANT — validator identity:
 * Angular tracks validators by function reference, not by source
 * equality. If the `dependencies` array is recreated on each call
 * (for example inside a method that builds it fresh every time),
 * every inline validator inside that array is a brand new function.
 *
 * Consequences of unstable references:
 *   - `hasValidator()` cannot find a previously-added validator
 *   - `removeValidators()` silently fails because the old reference
 *     is no longer reachable
 *   - Angular may accumulate duplicate validator entries
 *   - Validation state can drift out of sync with the rules
 *
 * Stable patterns (safe):
 *   - Validators declared as named functions outside the rule array
 *   - Inline validators defined once and reused across invocations
 *
 * Unstable patterns (avoid):
 *   - Rebuilding the dependencies array each time the setup runs
 *   - Inline validators inside a method that fires repeatedly
 *   - Factories that return a new `ValidatorFn` on every call
 *
 * Correct — named validator:
 *   const phoneValidator: ValidatorFn = c => checkPhone(c);
 *   const rules = [{ ...customValidatorRule, customValidators: [phoneValidator] }];
 *
 * Correct — inline but created once:
 *   const rules = [{ ...customValidatorRule, customValidators: [c => checkPhone(c)] }];
 *
 * Incorrect — rebuilt on each call:
 *   function buildRules() {
 *     return [{ ...customValidatorRule, customValidators: [c => checkPhone(c)] }];
 *   }
 */
export const customValidatorRule: Dependency = {
	type: DependencyType.CUSTOM_VALIDATOR
};