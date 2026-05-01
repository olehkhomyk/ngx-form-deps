# ngx-form-deps

Declarative dependency rules for Angular reactive forms. Let a control's value drive the state of other controls — clear them, enable/disable, patch values, toggle `required`, attach validators, or run a side effect — without hand-writing `valueChanges` subscriptions.

- Zero runtime dependencies (peer deps only: Angular + RxJS)
- Reactive and one-shot APIs
- Automatic lifecycle teardown via `DestroyRef`
- Type-safe generics on the main control's value
- Tree-shakeable (`sideEffects: false`)

## Installation

```bash
npm install ngx-form-deps
```

Peer requirements: `@angular/core >= 17`, `@angular/forms >= 17`, `rxjs >= 7`.

## Quick start

```ts
import { Component, DestroyRef, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  trackDependencies,
  toggleByBooleanRules,
  clearOnFalseRule,
  requiredRule,
} from 'ngx-form-deps';

@Component({ /* ... */ })
export class ShippingFormComponent {
  private destroyRef = inject(DestroyRef);

  hasShippingAddress = new FormControl(false);
  shippingStreet = new FormControl('');
  shippingCity = new FormControl('');

  ngOnInit() {
    const dependantControls = [this.shippingStreet, this.shippingCity];

    const dependencies = [
      ...toggleByBooleanRules,
      clearOnFalseRule,
      { ...requiredRule, match: { valueToMatch: true } },
    ];

    trackDependencies(
      this.hasShippingAddress,
      dependantControls,
      dependencies,
      this.destroyRef
    );
  }
}
```

When `hasShippingAddress` is `true`, the street and city fields are enabled and marked required. When it flips to `false`, they are cleared, disabled, and `required` is removed.

## Core concepts

### `Dependency` rule

A rule is a plain object with three parts:

```ts
interface Dependency<T> {
  type: DependencyType;          // which action to run
  match?: Match<T>;              // when the action runs
  customValidators?: ValidatorFn[];
  customHandler?: (value: T) => void;
  actionOptions?: ActionOptions; // Angular form options (e.g. emitEvent)
}
```

### `Match` predicate

The first satisfied branch wins. Order of evaluation:

1. `ifValueExists` — value is truthy
2. `ifValueNotExists` — value is falsy
3. `valueToMatch` — deep equality with value
4. `valueNotMatch` — deep inequality with value
5. `condition(value)` — custom predicate

### Action types

| `DependencyType`    | Effect                                              |
| ------------------- | --------------------------------------------------- |
| `CLEAR`             | Reset target controls to `null`                     |
| `DISABLE`           | Disable target controls                             |
| `ENABLE`            | Enable target controls                              |
| `REQUIRED`          | Toggle `Validators.required`                        |
| `CUSTOM_VALIDATOR`  | Add / remove user validators                        |
| `SET_VALUE`         | Write `match.valueToSet` into target controls       |
| `CUSTOM_HANDLER`    | Invoke `customHandler(controlValue)` when `match` passes |
| `ON_CHANGE`         | Invoke `customHandler(controlValue)` on every emission, no `match` needed |

## Preset rules

Import ready-made rule objects instead of building them by hand. Spread them into your rule list and override fields as needed.

| Preset                          | Shorthand for                                             |
| ------------------------------- | --------------------------------------------------------- |
| `clearRule`                     | Clear every time the main control emits                   |
| `clearOnFalseRule`              | Clear when the main value is strictly `false`             |
| `disableWhenEmptyRule`          | Disable while the main value is falsy                     |
| `enableWhenPresentRule`         | Enable while the main value is truthy                     |
| `toggleByPresenceRules`         | `[disableWhenEmptyRule, enableWhenPresentRule]`           |
| `toggleByBooleanRules`          | Enable on `true`, disable on `false`                      |
| `toggleByBooleanInverseRules`   | Enable on `false`, disable on `true`                      |
| `requiredRule`                  | Marker for toggling `Validators.required`                 |
| `setValueRule`                  | Marker for patching a value                               |
| `customHandlerRule`             | Marker for a conditional side effect                      |
| `onChangeRule`                  | Marker for a side effect on every emission                |
| `customValidatorRule`           | Marker for custom validators                              |

## API

### `trackDependencies(mainControl, dependantControls, dependencies, destroyRef, options?)`

Subscribes to `mainControl.valueChanges` and re-evaluates the rule list on every emission. The subscription auto-tears-down when `destroyRef` fires.

- `dependantControls` and `dependencies` can each be a static value **or** a function of the current main value — handy when the set depends on the emitted value.
- Options:
  - `startFromInitialValue` (default `true`) — evaluate rules once against the current raw value before subscribing.
  - `customPipe` — extra `MonoTypeOperatorFunction<T>` applied upstream (e.g. `debounceTime`).
  - `rootActionOptions` — default `ActionOptions` for every rule; per-rule values still win.

Returns the underlying `Subscription` for manual early teardown.

### `applyDependencies(controlValue, dependantControls, dependencies, options?)`

One-shot evaluation — no subscription. Use when you already have the main value and want to run the rules imperatively (for example, inside another observable, a lifecycle hook, or an event handler).

### Action helpers

Low-level helpers exposed for ad-hoc use. Each accepts optional `ActionOptions` that default to `{ emitEvent: false }` to avoid cascading updates.

- `clearControls(controls, options?)`
- `disableControls(controls, options?)`
- `enableControls(controls, options?)`
- `patchControls(controls, value, options?)`
- `setControlsRequired(controls, isRequired, options?)` / `setControlRequired(control, isRequired, options?)`
- `addControlsValidators(controls, validators, options?)` / `addControlValidators(control, validators, options?)`
- `removeControlsValidators(controls, validators, options?)`

## Advanced examples

### Rules that depend on the emitted value

```ts
trackDependencies(
  this.reportType,
  value => value === 'monthly' ? [this.monthCtrl] : [this.quarterCtrl],
  value => [
    { ...setValueRule, match: { ifValueExists: true, valueToSet: value === 'monthly' ? 1 : 'Q1' } },
  ],
  this.destroyRef
);
```

### Debounced tracking

```ts
import { debounceTime } from 'rxjs/operators';

trackDependencies(
  this.search,
  [this.resultsCtrl],
  [clearRule],
  this.destroyRef,
  { customPipe: debounceTime(200) }
);
```

### Validator stability

Angular matches validators by function reference. Do not rebuild the rule list on every call — inline validators inside a rebuilt list become new references, breaking `hasValidator` / `removeValidators`:

```ts
// DON'T — new validator every call
function buildRules() {
  return [{ ...customValidatorRule, customValidators: [c => checkPhone(c)] }];
}

// DO — stable reference
const phoneValidator: ValidatorFn = c => checkPhone(c);
const rules = [{ ...customValidatorRule, customValidators: [phoneValidator] }];
```

## License

MIT