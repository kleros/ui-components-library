// The app's own lint config. `npx kleros-ui init` keeps it (as eslint.config.app.js) and adds the Kleros UI preset.
import tseslint from "typescript-eslint";

export default [
  { files: ["**/*.{ts,tsx}"], languageOptions: { parser: tseslint.parser, parserOptions: { ecmaFeatures: { jsx: true } } } },
];
