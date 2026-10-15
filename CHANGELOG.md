# Changelog

Notable changes to `@kleros/ui-components-library`, for the apps that consume it. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow [Semantic Versioning](https://semver.org/).

Every pull request that changes what a consumer sees adds its entry under **Unreleased**. A release renames that heading to the version and date.

## [Unreleased]

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
