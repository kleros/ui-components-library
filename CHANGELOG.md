# Changelog

Notable changes to `@kleros/ui-components-library`, for the apps that consume it. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow [Semantic Versioning](https://semver.org/).

Every pull request that changes what a consumer sees adds its entry under **Unreleased**. A release moves those entries under a new heading with the version and date and leaves **Unreleased** in place, empty, for the next changes.

## [Unreleased]

### Breaking changes

None.

### Added

- BigNumberField: `onValueChange`, called when the value changes with the same number as `onChange`, or with `null` when the input holds none: when it is emptied (where `onChange` gets 0) or holds only `-`, `.` or `-.`. A field controlled through it can tell a cleared input from a typed 0, and stays empty when cleared instead of showing 0. `onChange` is unchanged ([#97](https://github.com/kleros/ui-components-library/issues/97)).
- BigNumberField: `value={null}` empties a controlled field, like `value=""`. It threw a TypeError before. Code that passes `value` is unaffected by the wider type. Code that reads the type back through `React.ComponentProps<typeof BigNumberField>` now sees `null` in it and may need a check; [semver-ts](https://www.semver-ts.org/formal-spec/1-definitions.html) does not count types built with `typeof` as part of a package's API ([#97](https://github.com/kleros/ui-components-library/issues/97)).

### Fixed

- BigNumberField: typing `.` or `-.` keeps that text instead of showing `NaN`, so `.5` gives 0.5. Before, an uncontrolled field got stuck on `NaN`, and in a controlled field the `.` disappeared when the NaN echoed back, so `.5` gave 5. From that text, the arrow keys, the wheel and the stepper buttons now step from empty. Blur empties the field, and `validate` then gets `null`, as for any empty field, where it got NaN. `onChange` still gets NaN for that text, until a digit follows (related to [#97](https://github.com/kleros/ui-components-library/issues/97)).
- BigNumberField: typing `.` over a selection that holds the decimal point replaces it. Before, the `.` was ignored, so selecting `2.7` and typing `.5` gave 5. As for any leading `.`, `onChange` gets NaN until the `5` follows.
- BigNumberField: a required field shows its error when blur empties a leftover `.` or `-.`.
- BigNumberField: a value set from outside after blur formatted the text, such as a reset to `""`, leaves the field unformatted. Before, the field kept treating its text as formatted: a pasted `1,5` read the comma as a group separator and gave 15 where a fresh field rejects it, and a value set afterwards was never formatted.
- NumberField: a read-only field no longer shows its stepper buttons on hover; BigNumberField already hid them. The buttons were disabled, so they could not change the value (related to [#98](https://github.com/kleros/ui-components-library/issues/98)).
- CustomRadio: arrow keys typed in a field inside the group, such as a TextField or BigNumberField next to the options, move that field's caret or value. Before, the group took them: it moved the selection, which could unmount the field, and cancelled the key. The options now sit in a `display: contents` element, so the group still lays them out, but a child selector such as `[role="radiogroup"] > label` no longer matches them ([#109](https://github.com/kleros/ui-components-library/issues/109)).
- The stylesheet no longer defines utilities that only the stories and tests used: `.container` (a max-width per breakpoint), `.collapse` (`visibility: collapse`), `.invisible`, `.w-auto`, `.w-20`, `.p-2`, `.pb-2`, `.ease-out`, `.fill-white`, `.text-red-500`, `.ring-2`, `.ring-offset-2`, `.ring-klerosUIComponentsPrimaryBlue`, and fixed widths and heights such as `.w-[500px]`. They styled any app element that had one of those class names. Tailwind now scans only the components ([#110](https://github.com/kleros/ui-components-library/issues/110)).

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
