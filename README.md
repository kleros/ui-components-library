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
