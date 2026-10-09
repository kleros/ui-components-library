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

### Installation

Install the package using your preferred package manager:

```bash
# Using yarn
yarn add @kleros/ui-components-library

# Using npm
npm install @kleros/ui-components-library
```

### Setup

1. Import the CSS:

   a. For Non-tailwind apps, import the CSS at top level of your app.

   ```javascript
   import "@kleros/ui-components-library/style.css";
   ```

   b. For Tailwind apps, import the theme and mark the library as a source in your global.css file.

   ```css
   @import "../../../node_modules/@kleros/ui-components-library/dist/assets/theme.css";
   @source "../../../node_modules/@kleros/ui-components-library";
   ```

2. Import and use components in your application:

```jsx
import { Button, TextField, Alert } from "@kleros/ui-components-library";

function MyComponent() {
  return (
    <div>
      <TextField label="Username" placeholder="Enter your username" />
      <Button>Submit</Button>
      <Alert type="success">Operation completed successfully!</Alert>
    </div>
  );
}
```

### Theme usage

If you wish the use the library's tailwind theme variables in your tailwind app. You can utilize it by importing the theme file in your `global.css` file.

```css
@import tailwindcss;
@import "../../../node_modules/@kleros/ui-components-library/dist/assets/theme.css";
```

You can find the available theme variables [here](src/styles/theme.css).
If want to override or edit the defined theme variables, you can do so like this:

```css
:root {
  --klerosUIComponentsWhiteBackground: #832323;
}
:root[class="dark"] {
  --klerosUIComponentsWhiteBackground: #832323;
}
```

### Peer Dependencies

This library requires the following peer dependencies:

- React 18+
- React DOM 18+
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

**Plays outside Vitest**: Chromatic runs each story's play without Vitest's `act()` wrapper, so a play that reads a React update synchronously can pass `yarn test:stories` and still fail in Chromatic. `yarn test:storybook-plays` renders every story of a built Storybook (`yarn build-storybook` first) in both themes and fails on any render or play error. The Storybook Tests workflow runs it after the story tests.

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
