<p align="center">
  <a href="https://kleros.io">
    <img alt="Kleros" src="https://github.com/kleros/court/blob/master/public/icon-512.png?raw=true" width="128">
  </a>
</p>

<h1 align="center">Kleros UI Components Library</h1>

<p align="center">
  <a href="https://conventionalcommits.org"><img src="https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg" alt="Conventional Commits"></a>
  <a href="http://commitizen.github.io/cz-cli/"><img src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg" alt="Commitizen Friendly"></a>
  <a href="https://github.com/prettier/prettier"><img src="https://img.shields.io/badge/styled_with-prettier-ff69b4.svg" alt="Styled with Prettier"></a>
</p>

## Introduction

The Kleros UI Components Library is a comprehensive collection of React components that implement the Kleros design system. This library provides a consistent and accessible user interface for Kleros applications, making it easier to build cohesive user experiences across the Kleros ecosystem.

Built with React, TypeScript, and Tailwind CSS, this library offers a wide range of components from basic UI elements to complex interactive widgets. Each component is designed with accessibility, customization, and ease of use in mind.

## Features

- **React-based components**: Built with React 18 and TypeScript for type safety
- **Tailwind CSS integration**: Leverages Tailwind for styling with consistent design tokens
- **Accessibility**: Components follow WAI-ARIA guidelines for maximum accessibility
- **Responsive design**: Components adapt to different screen sizes
- **Customizable**: Easily theme and extend components to match your application's design
- **Storybook documentation**: Interactive documentation with usage examples

## Components

The library includes a wide variety of components, including but not limited to:

- **Layout**: Box, Card, Modal
- **Navigation**: Breadcrumb, Pagination, Tabs
- **Form Elements**: TextField, TextArea, NumberField, Checkbox, RadioGroup, Switch, DatePicker, FileUploader
- **Data Display**: DisplaySmall, DisplayLarge, DisplayIcon, Tag, Tooltip
- **Feedback**: Alert, Push Notifications
- **Progress**: LinearProgress, CircularProgress, Steps, Timeline
- **Interactive Elements**: Button, Accordion, Dropdown, Cascader

## Usage

> **This is v3.** It is built on Tailwind CSS 4 and react-aria-components. There is no `styled-components`,
> no `ThemeProvider` and no `lightTheme`/`darkTheme` (those were v2). Check the major in your `package.json`
> before copying code from older apps. Interactive docs: [Storybook](https://kleros-v2-ui-storybook.netlify.app).

### Installation

```bash
npm install @kleros/ui-components-library
```

### Setup

1. New app: let the package's CLI write this setup; do not write it by hand. From a tarball, in the new folder:
   `echo '{}' > package.json`, `npm install ./x.tgz`, then `npx kleros-ui create .` (once a release with the CLI is on
   npm: `npx -p @kleros/ui-components-library kleros-ui create my-app`). See "Starting a new app, and AI agents" below.
   Every app styles its UI with Tailwind 4 only, so an existing app without Tailwind adds it first (`agent/AGENTS.md`,
   "Existing apps"). The two parts `create` writes:

   a. In your JS entry, before your own CSS, so your responsive classes win:

   ```ts
   import "@kleros/ui-components-library/style.css";
   ```

   b. Your Tailwind entry (`src/index.css`): these four lines, plus your theme import when the app has a theme
   (see "Theme usage"), and nothing else:

   ```css
   @import "tailwindcss";
   @import "@kleros/ui-components-library/theme.css";
   @source "../node_modules/@kleros/ui-components-library";
   @custom-variant dark (&:where(.dark, .dark *));
   ```

   With a theme, `npx kleros-ui theme` adds one line right after the library's `theme.css` import:
   `@import "./theme.css";`.

2. Dark mode is a `dark` class on the root element: `document.documentElement.classList.add("dark")`.

3. Import and use components. Every component's props are exported as `<Name>Props`, and list items as
   `TabsItem`, `DropdownSelectItem`, `TimelineItem` and so on.

```tsx
import { useState } from "react";
import { AlertMessage, Button, TextField, type DropdownSelectItem, DropdownSelect } from "@kleros/ui-components-library";

const courts: DropdownSelectItem[] = [
  { id: 1, text: "General Court", itemValue: 1 },
  { id: 2, text: "Blockchain", itemValue: 2 },
];

export function MyComponent() {
  const [name, setName] = useState("");
  const [court, setCourt] = useState<number>();
  const [sent, setSent] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <TextField label="Username" placeholder="Enter your username" value={name} onChange={setName} />
      <DropdownSelect label="Court" items={courts} callback={(item) => setCourt(item.itemValue)} />
      <Button text="Submit" isDisabled={!name || court === undefined} onPress={() => setSent(true)} />
      {sent && <AlertMessage variant="success" title="Saved" msg="Operation completed successfully!" />}
    </div>
  );
}
```

Conventions that differ from most React libraries: `Button` and `Tag` require `text`, which is the label, or the
accessible name when you pass children to show instead (an icon, a rich label); handlers are `onPress` and
`callback`; disabled is `isDisabled`; alerts are `AlertMessage` with `variant`, `title` and `msg`.

### Theme usage

The theme variables are in `theme.css` (prefix `--klerosUIComponents`), and the `dark` class on `<html>` switches
them. Use them as Tailwind classes, such as `bg-klerosUIComponentsWhiteBackground` and
`text-klerosUIComponentsPrimaryText`. `agent/LOOK.md` says which token goes where.

An app with colours of its own sets new token values in one theme file, and nowhere else. `npx kleros-ui theme`
writes `src/theme.css` (each library token and its value as a commented line), names it under `"theme"` in
`kleros-ui.json`, and imports it in your Tailwind entry right after the library's `theme.css`. To change a token,
uncomment its line and set the value: on `:root` for light and on `:root.dark` for dark, inside `@layer base`:

```css
@layer base {
  :root {
    --klerosUIComponentsPrimaryBlue: #0055aa;
  }
  :root.dark {
    --klerosUIComponentsPrimaryBlue: #66bbff;
  }
}
```

A token set only on `:root` keeps the library's dark value. `ui:check` and the build that `create` sets up fail on a
token redefined in any other stylesheet (one set from code, with `style.setProperty`, or by a class such as
`[--klerosUIComponentsPrimaryBlue:...]`, is the reviewer's to find). In the theme file they fail on a name that `theme.css` does not define, the
`--color-klerosUIComponents*` alias, another selector, property or at-rule, `!important`, and a rule outside
`@layer base` (it would leak into dark mode). One theme per app, for the whole page. Its contrast is the app's to check: the library's own light theme has known WCAG AA gaps
([#120](https://github.com/kleros/ui-components-library/issues/120)). `agent/AGENTS.md`, "Themes", has the rules.

### Peer Dependencies

This library requires the following peer dependencies:

- React 18 and React DOM 18. React 19 is not supported yet: the bundle uses React 18 internals, so a React 19
  app renders a blank page.
- Tailwind CSS 4+

Make sure these are installed in your project.

### Starting a new app, and AI agents

- **New app:** `npx -p @kleros/ui-components-library kleros-ui create my-app`. It copies the package's starter
  (`templates/poc`: Vite, React 18, Tailwind 4, ESLint, this library's CSS and the dark-mode variant), sets the library
  version, runs `npm install` and then `init`. From a tarball, in the new folder: `echo '{}' > package.json`,
  `npm install ./x.tgz`, then `npx kleros-ui create .` (the empty `package.json` keeps npm in this folder; without
  one, npm installs into the nearest folder above that has one). Then `npm run ui:check` and `npm run build`. The starter's
  build runs `kleros-ui check --build` first: the same checks with no baseline (a baselined finding still stops the
  build), where a needed `sync` or a missing agent block is only a note. When `create` keeps an app's own build
  script, it adds the check as a `prebuild` (npm, pnpm and Yarn 1 run it; Yarn 2+ and `--ignore-scripts` skip it). When
  the app has its own `prebuild` too, `create` keeps both and prints whether they run the check.
- **Existing app, before writing UI:** run `npx kleros-ui init` once. It adds a block to `AGENTS.md` that points coding
  agents at the guide, a `ui:check` script (type-check, the look lint, the app's CSS and the component registry) and
  the lint preset. Then follow "Existing apps" in `agent/AGENTS.md`: a Tailwind app imports this library's `style.css`
  in its JS entry before its own CSS (so its responsive classes win), and an app without Tailwind adds it, because
  every app styles new UI with Tailwind only. Then run `npm run ui:baseline`, so `ui:check` holds only new code to the
  rules. Apps whose `eslint-disable` comments name `no-restricted-syntax` or `no-restricted-imports`: the lint preset's
  restrictions are `kleros-ui/no-restricted-syntax` and `kleros-ui/no-restricted-imports`, so such a comment does not
  silence them; `ui:check` names each one, unless the app turns off ESLint's report of unused ones (`agent/AGENTS.md`,
  "Existing apps").
- **AI coding agents:** read this package's `agent/AGENTS.md` first. `agent/CATALOG.md` lists every component, the kit
  and the known gaps.
- **Reviewing a pull request:** nothing stops a setup written by hand, so the review does. `agent/REVIEW.md` is the
  checklist: the setup made by `create` or `init`, `ui:check` passing, tokens redefined only in the theme file, new
  components registered with intent words, and no raw controls.
## Development

### Local Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/kleros/ui-components-library.git
   cd ui-components-library
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Start the Storybook development server:

   ```bash
   yarn start
   ```

4. Build the library:
   ```bash
   yarn build
   ```

### Code Quality

This project uses:

- TypeScript for type checking
- ESLint for code linting
- Prettier for code formatting
- Husky for Git hooks
- Conventional Commits for commit messages

Run checks with:

```bash
yarn check-types    # Type checking
yarn check-style    # Linting
```

### Visual regression testing (Chromatic)

Every story is snapshotted by [Chromatic](https://www.chromatic.com/) and compared against the accepted baseline. The workflow lives in [`.github/workflows/chromatic.yml`](.github/workflows/chromatic.yml).

**What runs when**

- **Pull requests to `main`**: Storybook is built and uploaded to Chromatic. Visual changes don't fail the job (`exitZeroOnChanges`). Instead, Chromatic adds a "UI Tests" check to the PR, and someone reviews and accepts or denies the changes in the Chromatic web app. Superseded runs on the same PR are cancelled.
- **Pushes to `main`**: the build is auto-accepted (`autoAcceptChanges: main`), so whatever lands on `main` becomes the new baseline.
- **TurboSnap** (`onlyChanged: true`): only stories affected by the changed files are re-snapshotted. The rest are inherited from the baseline. TurboSnap needs the full git history, so the checkout uses `fetch-depth: 0`. A change to the Storybook config in `.storybook/` re-snapshots every story.

**Setup**: add the Chromatic project token as the repository secret `CHROMATIC_PROJECT_TOKEN` (Settings → Secrets and variables → Actions).

**Forks and Dependabot**: GitHub doesn't expose repository secrets to pull requests from forks or to Dependabot, so the job is skipped for those PRs instead of failing. A maintainer can push the branch to this repository to get a Chromatic build. The workflow deliberately avoids `pull_request_target`, which would run untrusted PR code with access to the token.

**Light and dark modes**: each story is captured twice, through [Chromatic modes](https://www.chromatic.com/docs/modes/) defined in [`.storybook/modes.ts`](.storybook/modes.ts). The modes set the Storybook `theme` global, which you can also switch from the Storybook toolbar. When `theme` is set, it overrides a story's `themeUI` arg. When it isn't set (the default), `themeUI` applies as before.

**Keeping snapshots deterministic**: Chromatic pauses CSS animations on their first frame. Stories opt out only when that frame or the current time would give a wrong or unstable snapshot:

- The progress stories use `chromatic: { pauseAnimationAtEnd: true }`, because the first frame of the fill animation is an empty bar.
- The Datepicker stories pass a fixed `defaultValue` and `minValue`, because the component defaults to "now".
- The File Viewer stories load local fixtures from `src/stories/fixtures`, and the pdf.js worker is served from react-doc-viewer's own copy (mapped to `/pdfjs` in `.storybook/main.ts`), so nothing is fetched from a CDN. Some are excluded with `chromatic: { disableSnapshot: true }`:
  - `FileViewer`, because pdf.js canvas output is not pixel-stable across runs.
  - `FailedResponseServerError`, `FailedResponseNotFound` and `DocumentSwitching`. Their snapshots haven't been checked for determinism yet.
- The `Internal/A11y Self Test` stories test the accessibility audit in `src/stories/a11y.ts`. They run only under the Vitest story runner and elsewhere render a "Skipped" note, so they are excluded too and hidden from the sidebar and docs.
- The `Internal/Trusted Event Filter Self Test` story moves the real cursor to check that the story tests drop trusted cursor events. It runs only under the Vitest story runner and is excluded and hidden the same way.

**Plays outside Vitest**: Chromatic runs each story's play without Vitest's `act()` wrapper, so a play that reads a React update synchronously can pass `yarn test:stories` and still fail in Chromatic. `yarn test:storybook-plays` renders every story of a built Storybook (`yarn build-storybook` first) in both themes and fails on any render or play error. Like the story tests, it drops trusted cursor events (`.storybook/trusted-event-filter.js`), so plays that depend on hover state surviving a real cursor are not covered. The Storybook Tests workflow runs it after the story tests.

**Running locally**:

```bash
yarn dlx chromatic --project-token=<CHROMATIC_PROJECT_TOKEN> --only-changed
```

## Package Publication

### Tagging

1. Bump the version in `package.json`
2. Run a clean build: `yarn clean && yarn build`
3. Commit the change to git: `git add -u ; git commit -m "chore: release"`
4. Tag this version: `version=v$(cat package.json | jq -r .version) && git tag -m $version $version`
5. Push both commit and tag: `git push && git push --tags`

### Publish to NPM

1. Export your NPM token: `export YARN_NPM_AUTH_TOKEN=<npm_xxxxxxxxxxxx>`
2. Publish: `yarn publish`

### Publish to GitHub

1. Login:

   ```bash
   npm login --registry https://npm.pkg.github.com --auth-type legacy
   > Username: YOUR_GITHUB_USERNAME
   > Password: YOUR_GITHUB_PERSONAL_ACCESS_TOKEN
   ```

2. Publish: `npm publish --registry https://npm.pkg.github.com`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes using conventional commits (`git commit -m 'feat: add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
