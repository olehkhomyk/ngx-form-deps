/**
 * Action performed by a {@link Dependency} rule when its `match`
 * condition is satisfied.
 */
export enum DependencyType {
	/** Reset the target controls to `null`. */
	CLEAR = 'CLEAR',
	/** Disable the target controls. */
	DISABLE = 'DISABLE',
	/** Enable the target controls. */
	ENABLE = 'ENABLE',
	/** Toggle `Validators.required` on the target controls. */
	REQUIRED = 'REQUIRED',
	/** Add or remove a user-supplied set of validators. */
	CUSTOM_VALIDATOR = 'CUSTOM_VALIDATOR',
	/** Patch a value into the target controls. */
	SET_VALUE = 'SET_VALUE',
	/** Invoke a user-supplied side effect callback. */
	CUSTOM_HANDLER = 'CUSTOM_HANDLER',
	/** Invoke a user-supplied callback whenever the source control's value changes. */
	ON_CHANGE = 'ON_CHANGE',
}

