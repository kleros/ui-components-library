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

1. Import the CSS once, at the top level of your app.

   a. Apps without Tailwind:

   ```ts
   import "@kleros/ui-components-library/style.css";
   ```

   b. Tailwind 4 apps, in your global CSS file:

   ```css
   @import "tailwindcss";
   @import "@kleros/ui-components-library/theme.css";
   @source "../node_modules/@kleros/ui-components-library";
   ```

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

Conventions that differ from most React libraries: `Button` takes `text` (no children); handlers are `onPress`
and `callback`; disabled is `isDisabled`; alerts are `AlertMessage` with `variant`, `title` and `msg`.

### Theme usage

The theme variables are in `theme.css` (prefix `--klerosUIComponents`). Override them like this:

```css
:root {
  --klerosUIComponentsWhiteBackground: #832323;
}
:root.dark {
  --klerosUIComponentsWhiteBackground: #832323;
}
```

### Peer Dependencies

This library requires the following peer dependencies:

- React 18 and React DOM 18. React 19 is not supported yet: the bundle uses React 18 internals, so a React 19
  app renders a blank page.
- Tailwind CSS 4+

Make sure these are installed in your project.

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
