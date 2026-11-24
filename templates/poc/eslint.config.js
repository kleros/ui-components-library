// The app's own lint config. `npx -p @kleros/ui-components-library kleros-ui init` keeps it (as eslint.config.app.js) and adds the Kleros UI preset.
import tseslint from "typescript-eslint";

export default [
  { files: ["**/*.{ts,tsx}"], languageOptions: { parser: tseslint.parser, parserOptions: { ecmaFeatures: { jsx: true } } } },
];
