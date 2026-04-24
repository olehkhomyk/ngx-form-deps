import { AbstractControl, ValidatorFn, Validators } from "@angular/forms";
import { ActionOptions } from "../type/dependency";

/**
 * Resets each control's value to `null`.
 *
 * @param controls - Target controls.
 * @param options - Angular form action options; defaults to suppressing events.
 */
export function clearControls(controls: AbstractControl[], options?: ActionOptions): void {
	for (const control of controls) {
		try {
			control.reset(null, options);
		} catch (e) {
			console.error(`clearControls error: ${String(e)}`);
		}
	}
}

/**
 * Disables every target control.
 *
 * @param controls - Target controls.
 * @param options - Angular form action options; defaults to suppressing events.
 */
export function disableControls(controls: AbstractControl[], options?: ActionOptions): void {
	for (const control of controls) {
		try {
			control.disable(options);
		} catch (e) {
			console.error(`disableControls error: ${String(e)}`);
		}
	}
}

/**
 * Enables every target control.
 *
 * @param controls - Target controls.
 * @param options - Angular form action options; defaults to suppressing events.
 */
export function enableControls(controls: AbstractControl[], options?: ActionOptions): void {
	for (const control of controls) {
		try {
			control.enable(options);
		} catch (e) {
			console.error(`enableControls error: ${String(e)}`);
		}
	}
}

/**
 * Patches each target control with the given value via
 * `AbstractControl.patchValue`. The same value is written to every
 * control in the list.
 *
 * @param controls - Target controls.
 * @param value - Value passed to `patchValue`.
 * @param options - Angular form action options; defaults to suppressing events.
 */
export function patchControls(
	controls: AbstractControl[],
	value: unknown,
	options?: ActionOptions
): void {
	for (const control of controls) {
		try {
			control.patchValue(value, options);
		} catch (e) {
			console.error(`patchControls error: ${String(e)}`);
		}
	}
}

/**
 * Adds or removes `Validators.required` on every control in the list.
 *
 * @param controls - Target controls.
 * @param isRequired - Whether the controls should be marked as required.
 * @param options - Angular form action options; defaults to suppressing events.
 */
export function setControlsRequired(
	controls: AbstractControl[],
	isRequired: boolean,
	options?: ActionOptions
): void {
	for (const control of controls) {
		setControlRequired(control, isRequired, options);
	}
}

/**
 * Single-control variant of {@link setControlsRequired}. Skips the
 * work when the control is already in the desired state.
 *
 * @param control - Target control.
 * @param isRequired - Whether the control should be marked as required.
 * @param options - Angular form action options; defaults to suppressing events.
 */
export function setControlRequired(
	control: AbstractControl,
	isRequired: boolean,
	options?: ActionOptions
): void {
	try {
		const hasRequired = control.hasValidator(Validators.required);
		if (isRequired && !hasRequired) {
			control.addValidators(Validators.required);
		} else if (!isRequired && hasRequired) {
			control.removeValidators(Validators.required);
		}
		control.updateValueAndValidity(options);
	} catch (e) {
		console.error(`setControlRequired error: ${String(e)}`);
	}
}

/**
 * Adds each validator from `validators` to every control in the list,
 * skipping validators that are already attached (by reference).
 *
 * See {@link Dependency} documentation on validator reference
 * stability — passing a new `ValidatorFn` instance on every call
 * defeats this idempotency and causes duplicate entries.
 *
 * @param controls - Target controls.
 * @param validators - Validators to attach.
 * @param options - Angular form action options; defaults to suppressing events.
 */
export function addControlsValidators(
	controls: AbstractControl[],
	validators: ValidatorFn[],
	options?: ActionOptions
): void {
	for (const control of controls) {
		addControlValidators(control, validators, options);
	}
}

/**
 * Single-control variant of {@link addControlsValidators}.
 *
 * @param control - Target control.
 * @param validators - Validators to attach.
 * @param options - Angular form action options; defaults to suppressing events.
 */
export function addControlValidators(
	control: AbstractControl,
	validators: ValidatorFn[],
	options?: ActionOptions
): void {
	try {
		for (const validator of validators) {
			if (!control.hasValidator(validator)) {
				control.addValidators(validator);
			}
		}
		control.updateValueAndValidity(options);
	} catch (e) {
		console.error(`addControlValidators error: ${String(e)}`);
	}
}

/**
 * Removes the given validators from every control in the list.
 *
 * @param controls - Target controls.
 * @param validators - Validators to detach.
 * @param options - Angular form action options; defaults to suppressing events.
 */
export function removeControlsValidators(
	controls: AbstractControl[],
	validators: ValidatorFn[],
	options?: ActionOptions
): void {
	for (const control of controls) {
		control.removeValidators(validators);
		control.updateValueAndValidity(options);
	}
}

