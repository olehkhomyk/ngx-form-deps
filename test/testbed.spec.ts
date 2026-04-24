import { TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';

import { applyDependencies, DependencyType } from '../src';

describe('Angular TestBed setup', () => {
	let formBuilder: FormBuilder;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [ReactiveFormsModule]
		}).compileComponents();

		formBuilder = TestBed.inject(FormBuilder);
	});

	it('applies library rules inside a TestBed-backed reactive forms test', () => {
		const form = formBuilder.group({
			main: false,
			dependant: ''
		});
		const dependant = form.get('dependant');

		expect(dependant).not.toBeNull();

		applyDependencies(true, [dependant!], [
			{
				type: DependencyType.REQUIRED,
				match: { valueToMatch: true }
			}
		]);

		expect(dependant!.hasValidator(Validators.required)).toBe(true);
	});
});
