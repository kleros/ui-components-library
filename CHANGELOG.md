# Changelog

Notable changes to `@kleros/ui-components-library`, for the apps that consume it. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow [Semantic Versioning](https://semver.org/).

Every pull request that changes what a consumer sees adds its entry under **Unreleased**. A release moves those entries under a new heading with the version and date and leaves **Unreleased** in place, empty, for the next changes.

## [Unreleased]

### Breaking changes

None.

### Added

- LinearProgress: `width` is optional. Without it the bar fills its container and follows it when it resizes. A number keeps today's fixed width.
- CircularProgress: a `tone` prop (`success`, `warning`, `error`, `info`, `neutral`, `accent`) sets the fill colour at every value. Without it the fill stays blue and turns green at 100%. The `CircularProgressTone` type is exported.
- Card: a `fluid` prop sizes the card to its content and its container instead of the fixed 328×200.
- Modal: a `fluid` prop sizes the dialog to its content, up to the viewport, instead of the fixed 328×200.
- Types: every component's prop and item types are exported under unique names (for example `TabsItem`), and the published declarations keep their JSDoc, with examples on `Button`, `DropdownSelect`, `BigNumberField` and `Tabs`.
- Tag: `children` render instead of `text`, which stays required and becomes the accessible name. A `toggle` prop announces `active` as `aria-pressed`.
- Tooltip: a `content` prop takes rich content, which replaces `text`. The `wrapperProps.role` option (default `button`) is documented.
- TextField: `labelContent` and `description` take rich content for the label and the description slot. `label` and `message` stay strings, and the rich prop wins when both are set.
- TextArea: `labelContent` and `description` take rich content for the label and the description slot. `label` and `message` stay strings, and the rich prop wins when both are set.
- NumberField: `labelContent` and `description` take rich content for the label and the description slot. `label` and `message` stay strings, and the rich prop wins when both are set.
- Breadcrumb: an item with `href` renders a link (react-aria `Link`) instead of a button. The last item has `aria-current="page"`. `as="nav"` with an `aria-label` (default "Breadcrumb") makes it a navigation landmark; the default stays a `div`.
- Button: a `title` prop that renders as the native tooltip, a `ref` to the `<button>`, and `children` that render instead of `text`, which stays required and names the button (a caller's `aria-label` wins), so icon-only buttons have a name.
- Copiable: the copy button has an accessible name (`info`, default "Copy"), and a visually hidden live region announces "Copied" or "Copy failed". New `onCopy` and `onCopyError` callbacks, and `feedbackDuration` (default 2000 ms). A failed clipboard write is no longer swallowed.
- `cn`: the class-name helper the components use (clsx plus tailwind-merge) is exported, so an app's `className` can override a default class.
- Kit: `@kleros/ui-components-library/kit` adds app-level pieces built only from the library's components and theme tokens: layout (`Stack`, `Inline`, `Grid`, `Section`, `Page`, `FormStack`), loading, empty and error states (`Skeleton`, `Spinner`, `EmptyState`, `InfoCard`, `ErrorState`, `QueryState`), data (`StatCard`, `AddressDisplay`, `TokenAmount`, `DataTable`, `KeyValueList`, `Sparkline`), `StatusBadge`, forms (`FormField`, `WizardShell`), `Countdown`, and app pieces (`ExternalLink`, `HelpTooltip`, `ThemeToggle`, `ChainGuard`), with `useCountdown`, `useDarkMode`, `applyInitialTheme`, `shortenAddress`, `formatUnits`, `parseUnits`, `toneClasses`, `readToken` and `cn`. Its classes reach an app through the Tailwind entry's `@source` line (README, Setup). Under `"moduleResolution": "node"`, TypeScript finds its types through `typesVersions`.
- Lint preset: `@kleros/ui-components-library/eslint`, for an ESLint 9 flat config, holds an app's code to the library's look. It reports a raw control where the library has a component, a local component with a library or kit name, styled-components and other CSS-in-JS, a `<style>` block, inline style that sets colour, spacing or type, colour literals, and hand-written timers, wei conversions and address shortening, under `kleros-ui/no-styled-components`, `kleros-ui/no-restricted-syntax` and `kleros-ui/no-restricted-imports`, so an app's own `no-restricted-syntax` and `no-restricted-imports` options keep working. Its Tailwind class rules (palette colours, `dark:` colour overrides, off-scale spacing, radius, font size and weight, arbitrary colours) need `eslint-plugin-better-tailwindcss`, an optional peer dependency, and are skipped without it.
- Agent guide: the package ships `agent/AGENTS.md`, the guide for AI coding agents (setup, Tailwind only, themes, existing apps), `agent/LOOK.md` (which token goes where), `agent/NEW-COMPONENT.md`, `agent/REVIEW.md` (a five-part checklist for pull request reviewers), and `agent/CATALOG.md` with `agent/catalog.json`, which list every component, the kit and the known gaps. `recipes/` holds three example screens, and `agent/templates/` the files `kleros-ui new` writes.
- Story types: `@kleros/ui-components-library/story-types` exports minimal `Meta` and `StoryObj` types, so an app's stories type-check without Storybook installed.
- CLI: the `kleros-ui` command. `create` copies the starter app (`templates/poc`: Vite, React 18, Tailwind 4, ESLint and this library's CSS), sets the library version, installs and runs `init`. `init` sets up an existing app: a block in `AGENTS.md` that points coding agents at the guide, the lint preset, `kleros-ui.json`, and the `ui:check` and `ui:baseline` scripts. `new` scaffolds a component and registers it with its intent words. `check` (`npm run ui:check`) runs the type-check, the lint, the CSS scan and the registry check, and the starter's build runs `check --build` first. `css` scans the app's stylesheets, `theme` writes the one theme file where an app sets its own token values, `baseline` records an existing app's findings so that only new code is held to the rules, and `sync` updates the agent block.

### Changed

- Types and description: the first line of `ui-components-library.d.ts`, `lib/index.d.ts` and each kit type file, and the package description, say that a new app is set up with `npx kleros-ui create` and name the guide.
- Package: the published `package.json` has no `prepare` script. It ran `husky install`, which sets up this repository's git hooks, and npm listed it as an install script it did not run. `package.json` itself is exported.

### Fixed

- Box passes every prop except `className` to its element (`id`, `role`, `aria-*`, handlers), where it dropped all but `children` and `className`.
- CircularProgress no longer renders a stray `0` next to the label at 0%.
- CircularProgress keeps a caller's `aria-label` instead of replacing it with the percentage.
- Timeline keeps its titles, parties and dates inside its box: the text wraps within the half of the box beside the spine, where it ran out of any box narrower than about twice the text. A word wider than that half, such as a full address, a transaction hash or a long compound word, wraps too. The spine stays centred, and rows whose text already fits look the same. CustomTimeline is unchanged.
- Timeline no longer widens the page: its shifted rows reached half the box past one edge (the right with `rightSided`), so a phone could scroll sideways into empty space. The list clips that horizontal overflow (`overflow-x: clip`), with no visible change.
- Steps (horizontal): below `lg`, the first step's title aligns to its bullet's left edge and the last step's title to its bullet's right edge, so neither hangs outside the list. Titles between them, and a single step's title, stay centred under their bullets.
- Package: `react`, `react-dom` and `react-is` are `^18` peer dependencies only, no longer also dependencies. A React 19 app now stops at `npm install` with a peer-dependency error, where it installed a second React and rendered a blank page. React 19 is not supported yet.

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
