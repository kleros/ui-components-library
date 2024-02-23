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

## Usage

#### Install the package
With `yarn add @kleros/ui-components-library` or `npm install @kleros/ui-components-library`

#### Create a theme file
Where you destructure `lightTheme` or `darkTheme` (or both) in your theme object to provide the correct colors to the components. ([example](https://github.com/kleros/kleros-v2/blob/dev/web/src/styles/themes.ts)).

#### Provide the theme
With styled-components `ThemeProvider` ([example](https://github.com/kleros/kleros-v2/blob/dev/web/src/context/StyledComponentsProvider.tsx)).

## Package Publication 

#### Tagging
1. Bump the version in `package.json`
1. Run a clean build: `yarn clean && yarn build`
1. Commit the change to git: `git add -u ; git commit -m "chore: release"`
1. Tag this version: `version=v$(cat package.json | jq -r .version) && git tag -m $version $version`
1. Push both commit and tag: `git push && git push --tags`

#### Publish to NPM
1. Export your NPM token: ` export YARN_NPM_AUTH_TOKEN=<npm_xxxxxxxxxxxx>`
1. Publish: `yarn publish`

#### Publish to Github
1. Login 
```bash
npm login --registry https://npm.pkg.github.com --auth-type legacy
> Username: YOUR_GITHUB_USERNAME
> Password: YOUR_GITHUB_PERSONAL_ACCESS_TOKEN`
```
2. Publish: `npm publish --registry https://npm.pkg.github.com`
