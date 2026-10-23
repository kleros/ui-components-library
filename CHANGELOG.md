# Changelog

Notable changes to `@kleros/ui-components-library`, for the apps that consume it. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow [Semantic Versioning](https://semver.org/).

Every pull request that changes what a consumer sees adds its entry under **Unreleased**. A release moves those entries under a new heading with the version and date and leaves **Unreleased** in place, empty, for the next changes.

## [Unreleased]

### Breaking changes

None. The react-aria-components upgrade changes some behaviour; see **Changed**.

### Added

- BigNumberField: `onValueChange`, called when the value changes with the same number as `onChange`, or with `null` when the input holds none: when it is emptied (where `onChange` gets 0) or holds only `-`, `.` or `-.`. A field controlled through it can tell a cleared input from a typed 0, and stays empty when cleared instead of showing 0. `onChange` is unchanged ([#97](https://github.com/kleros/ui-components-library/issues/97)).
- BigNumberField: `value={null}` empties a controlled field, like `value=""`. It threw a TypeError before. Code that passes `value` is unaffected by the wider type. Code that reads the type back through `React.ComponentProps<typeof BigNumberField>` now sees `null` in it and may need a check; [semver-ts](https://www.semver-ts.org/formal-spec/1-definitions.html) does not count types built with `typeof` as part of a package's API ([#97](https://github.com/kleros/ui-components-library/issues/97)).
- DropdownSelect and DropdownCascader: `buttonClassName` styles the trigger button, for example `buttonClassName="w-full"` to make it as wide as the field. `className` still styles the outer wrapper ([#105](https://github.com/kleros/ui-components-library/issues/105)).
- DropdownSelect: `selectionMode="multiple"` lets the user pick several items. The list stays open while they pick, `callback` gets the selected items, and `value`, `defaultValue` and `onChange` take arrays of keys; `onSelectionChange` is not called. With several items picked, the button lists their texts, cut with an ellipsis when they don't fit. In a form, `isRequired` asks for at least one item and `name` submits every selected key ([#106](https://github.com/kleros/ui-components-library/issues/106)).

### Changed

- The bundled react-aria-components is 1.20.0, up from 1.7.1, and the dependency range is `^1.20.0`. The library bundles it, so this is the version apps run, and the range keeps the types they compile against in step. Apps may notice:
  - DropdownSelect: picking the option that is already selected no longer calls `callback` or `onSelectionChange`. They run when the selection changes, like a native `<select>`'s `change` event.
  - DropdownSelect and DropdownCascader: react-aria's `value`, `defaultValue` and `onChange` take effect. Their types already allowed them, but react-aria 1.7.1 ignored them.
  - Modal, and the popovers of DropdownSelect, DropdownCascader and DatePicker: while one is open, the rest of the page is inert, not only `aria-hidden`, so it can't be clicked or focused. Content that must stay usable over it, such as a toast, needs the `data-react-aria-top-layer` attribute.
  - Checkbox and Switch: react-aria handles a click on the label instead of the browser forwarding it to the input. Real clicks work as before, but react-aria reads the pointer events of a `@testing-library/user-event` click as a screen reader's and ignores them on the label, so a test should click the control (`getByRole("checkbox")`).
  - Checkbox, RadioGroup and Switch: pressing Enter submits the form they are in.
  - RadioGroup: when a click submits a form in which the group is invalid, react-aria focuses its first radio but no longer shows the focus ring ([react-spectrum#10751](https://github.com/adobe/react-spectrum/issues/10751)). Submitting with the keyboard still shows it.
  - Button: `onClick` also runs when the button is pressed with the keyboard, not only when it is clicked. `onPress` remains the handler to use.
  - DatePicker: clearing a segment no longer calls `onChange` with `null`.
  - NumberField: a disabled field is left out of its form's data, as a disabled native input is.

### Fixed

- BigNumberField: typing `.` or `-.` keeps that text instead of showing `NaN`, so `.5` gives 0.5. Before, an uncontrolled field got stuck on `NaN`, and in a controlled field the `.` disappeared when the NaN echoed back, so `.5` gave 5. From that text, the arrow keys, the wheel and the stepper buttons now step from empty. Blur empties the field, and `validate` then gets `null`, as for any empty field, where it got NaN. `onChange` still gets NaN for that text, until a digit follows (related to [#97](https://github.com/kleros/ui-components-library/issues/97)).
- BigNumberField: typing `.` over a selection that holds the decimal point replaces it. Before, the `.` was ignored, so selecting `2.7` and typing `.5` gave 5. As for any leading `.`, `onChange` gets NaN until the `5` follows.
- BigNumberField: a required field shows its error when blur empties a leftover `.` or `-.`.
- BigNumberField: a value set from outside after blur formatted the text, such as a reset to `""`, leaves the field unformatted. Before, the field kept treating its text as formatted: a pasted `1,5` read the comma as a group separator and gave 15 where a fresh field rejects it, and a value set afterwards was never formatted.
- NumberField: a read-only field no longer shows its stepper buttons on hover; BigNumberField already hid them. The buttons were disabled, so they could not change the value (related to [#98](https://github.com/kleros/ui-components-library/issues/98)).
- CustomRadio: arrow keys typed in a field inside the group, such as a TextField or BigNumberField next to the options, move that field's caret or value. Before, the group took them: it moved the selection, which could unmount the field, and cancelled the key. The options now sit in a `display: contents` element, so the group still lays them out, but a child selector such as `[role="radiogroup"] > label` no longer matches them ([#109](https://github.com/kleros/ui-components-library/issues/109)).
- The stylesheet no longer defines utilities that only the stories and tests used: `.container` (a max-width per breakpoint), `.collapse` (`visibility: collapse`), `.w-auto`, `.w-20`, `.p-2`, `.pb-2`, `.ease-out`, `.fill-white`, `.text-red-500`, `.ring-2`, `.ring-offset-2`, `.ring-klerosUIComponentsPrimaryBlue`, and fixed widths and heights such as `.w-[500px]`. They styled any app element that had one of those class names. Tailwind now scans only the components ([#110](https://github.com/kleros/ui-components-library/issues/110)).
- DropdownSelect and DropdownCascader: a long selected text stays on one line inside the button, cut with an ellipsis, and the arrow keeps its size. Before, the text wrapped onto a second line, and a long word such as an address ran past the border. The button is also never wider than its field: in a field narrower than 240px it shrinks instead of overflowing ([#105](https://github.com/kleros/ui-components-library/issues/105)).
- DropdownSelect: the list shows long options in full, breaking long words, and is never narrower than the button ([#105](https://github.com/kleros/ui-components-library/issues/105)).

## [3.10.0] - 2026-10-15

### Breaking changes

None.

### Added

- Theme: ten colours from kleros-v2, in light and dark and as Tailwind utilities: `DarkPurple`, `VioletPurple`, `LavenderPurple`, `WhiteLowOpacitySubtle`, `WhiteLowOpacityStrong`, `BlackLowOpacity`, `SkeletonBackground`, `SkeletonHighlight`, `PaleCyan`, `LimeGreen` ([#93](https://github.com/kleros/ui-components-library/issues/93)).

### Changed

- DropdownSelect and Tabs call a caller's `onSelectionChange`, and Slider calls a caller's `onChange`. These props were accepted but ignored before ([#90](https://github.com/kleros/ui-components-library/issues/90)).
- Tabs: `defaultSelectedKey` selects that tab. Before, it only moved the underline ([#90](https://github.com/kleros/ui-components-library/issues/90)).
- FileUploader: the info icon uses the message's text colour, and every message icon is centred on the first line of the message. The message text sits 1px lower ([#92](https://github.com/kleros/ui-components-library/issues/92)).

### Fixed

- DropdownSelect and DropdownCascader keep a caller's `aria-label` instead of replacing it with "Select", and no longer repeat a visible label in the accessible name ([#96](https://github.com/kleros/ui-components-library/issues/96)).
- Tabs: the underline, label colour and icon follow the selected tab for default, controlled and clicked selection ([#90](https://github.com/kleros/ui-components-library/issues/90)).
- DropdownCascader: changing a controlled `selectedKey` moves the highlighted item in the open tree ([#90](https://github.com/kleros/ui-components-library/issues/90)).
- BigNumberField: a controlled field keeps the text being typed when its value echoes back through `onChange` (`1.05`, Backspace gives `1.0`), and `value=""` shows an empty field instead of `NaN` ([#97](https://github.com/kleros/ui-components-library/issues/97)).
- Timeline and CustomTimeline: the bullet is centred on its title, there is no connector above the first bullet, and the bullet stays centred when the title wraps or resizes ([#100](https://github.com/kleros/ui-components-library/issues/100)).
- FileViewer: the scroll container uses the library's thin scrollbar ([#94](https://github.com/kleros/ui-components-library/issues/94)).

## [3.9.0] - 2026-08-31

Earlier releases are recorded only as git tags; see the [tags](https://github.com/kleros/ui-components-library/tags).

[Unreleased]: https://github.com/kleros/ui-components-library/compare/v3.10.0...HEAD
[3.10.0]: https://github.com/kleros/ui-components-library/compare/v3.9.0...v3.10.0
[3.9.0]: https://github.com/kleros/ui-components-library/releases/tag/v3.9.0
