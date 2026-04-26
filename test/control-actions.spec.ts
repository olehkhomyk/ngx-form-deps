import { FormControl, Validators } from '@angular/forms';
import { describe, expect, it } from 'vitest';

import {
	addControlValidators,
	addControlsValidators,
	clearControls,
	disableControls,
	enableControls,
	patchControls,
	removeControlsValidators,
	setControlRequired,
	setControlsRequired
} from '../src/helpers/control-actions';

describe('clearControls', () => {
	it('resets control value to null', () => {
		const control = new FormControl('hello');
		clearControls([control]);
		expect(control.value).toBeNull();
	});

	it('resets multiple controls', () => {
		const a = new FormControl('a');
		const b = new FormControl('b');
		clearControls([a, b]);
		expect(a.value).toBeNull();
		expect(b.value).toBeNull();
	});

	it('does nothing when list is empty', () => {
		expect(() => clearControls([])).not.toThrow();
	});
});

describe('disableControls', () => {
	it('disables a control', () => {
		const control = new FormControl('x');
		disableControls([control]);
		expect(control.disabled).toBe(true);
	});

	it('disables multiple controls', () => {
		const a = new FormControl('a');
		const b = new FormControl('b');
		disableControls([a, b]);
		expect(a.disabled).toBe(true);
		expect(b.disabled).toBe(true);
	});
});

describe('enableControls', () => {
	it('enables a disabled control', () => {
		const control = new FormControl({ value: 'x', disabled: true });
		enableControls([control]);
		expect(control.enabled).toBe(true);
	});

	it('enables multiple controls', () => {
		const a = new FormControl({ value: 'a', disabled: true });
		const b = new FormControl({ value: 'b', disabled: true });
		enableControls([a, b]);
		expect(a.enabled).toBe(true);
		expect(b.enabled).toBe(true);
	});
});

describe('setControlRequired', () => {
	it('adds required validator when isRequired is true', () => {
		const control = new FormControl('');
		setControlRequired(control, true);
		expect(control.hasError('required')).toBe(true);
	});

	it('removes required validator when isRequired is false', () => {
		const control = new FormControl('');
		setControlRequired(control, true);
		setControlRequired(control, false);
		expect(control.hasError('required')).toBe(false);
	});

	it('does not add required twice', () => {
		const control = new FormControl('');
		setControlRequired(control, true);
		setControlRequired(control, true);
		control.setValue('');
		expect(control.errors).toEqual({ required: true });
	});
});

describe('setControlsRequired', () => {
	it('applies required to multiple controls', () => {
		const a = new FormControl('');
		const b = new FormControl('');
		setControlsRequired([a, b], true);
		expect(a.hasError('required')).toBe(true);
		expect(b.hasError('required')).toBe(true);
	});

	it('removes required from multiple controls', () => {
		const a = new FormControl('');
		const b = new FormControl('');
		setControlsRequired([a, b], true);
		setControlsRequired([a, b], false);
		expect(a.hasError('required')).toBe(false);
		expect(b.hasError('required')).toBe(false);
	});
});

describe('patchControls', () => {
	it('patches a single control with the given value', () => {
		const control = new FormControl('old');
		patchControls([control], 'new');
		expect(control.value).toBe('new');
	});

	it('patches multiple controls with the same value', () => {
		const a = new FormControl('a');
		const b = new FormControl('b');
		patchControls([a, b], 42);
		expect(a.value).toBe(42);
		expect(b.value).toBe(42);
	});

	it('patches with null', () => {
		const control = new FormControl('x');
		patchControls([control], null);
		expect(control.value).toBeNull();
	});
});

describe('addControlValidators', () => {
	it('adds a validator to a control', () => {
		const control = new FormControl('');
		addControlValidators(control, [Validators.required]);
		expect(control.hasValidator(Validators.required)).toBe(true);
	});

	it('does not add the same validator twice', () => {
		const control = new FormControl('');
		addControlValidators(control, [Validators.required]);
		addControlValidators(control, [Validators.required]);
		control.setValue('');
		expect(control.errors).toEqual({ required: true });
	});

	it('adds multiple validators at once', () => {
		const control = new FormControl('');
		addControlValidators(control, [Validators.required, Validators.email]);
		expect(control.hasValidator(Validators.required)).toBe(true);
		expect(control.hasValidator(Validators.email)).toBe(true);
	});
});

describe('addControlsValidators', () => {
	it('adds validators to multiple controls', () => {
		const a = new FormControl('');
		const b = new FormControl('');
		addControlsValidators([a, b], [Validators.required]);
		expect(a.hasValidator(Validators.required)).toBe(true);
		expect(b.hasValidator(Validators.required)).toBe(true);
	});
});

describe('removeControlsValidators', () => {
	it('removes a validator from multiple controls', () => {
		const a = new FormControl('');
		const b = new FormControl('');
		addControlsValidators([a, b], [Validators.required]);
		removeControlsValidators([a, b], [Validators.required]);
		expect(a.hasValidator(Validators.required)).toBe(false);
		expect(b.hasValidator(Validators.required)).toBe(false);
	});

	it('does nothing when validator was not attached', () => {
		const control = new FormControl('');
		expect(() => removeControlsValidators([control], [Validators.required])).not.toThrow();
	});
});