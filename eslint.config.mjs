import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import security from "eslint-plugin-security";
import _import from "eslint-plugin-import";
import globals from "globals";
// eslint-disable-next-line import/no-unresolved
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: ["src/assets"],
  },
  ...fixupConfigRules(
    compat.extends(
      "eslint:recommended",
      "plugin:react/recommended",
      "plugin:react-hooks/recommended",
      "plugin:import/recommended",
      "plugin:import/react",
      "plugin:@typescript-eslint/recommended",
      "plugin:prettier/recommended",
      "prettier",
      "plugin:security/recommended-legacy",
    ),
  ),
  {
    plugins: {
      react: fixupPluginRules(react),
      "react-hooks": fixupPluginRules(reactHooks),
      security: fixupPluginRules(security),
      import: fixupPluginRules(_import),
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        Atomics: "readonly",
        SharedArrayBuffer: "readonly",
      },

      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: "module",

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    settings: {
      react: {
        version: "^16.12.0",
      },

      "import/resolver": {
        parcel: {
          rootDir: "src",
          extensions: [".js", ".jsx", ".ts", ".tsx", ".svg", ".png", ".jpeg"],
        },
      },
    },

    rules: {
      "max-len": [
        "warn",
        {
          code: 80,
        },
      ],

      "react/prop-types": 0,
      "no-unused-vars": "off",

      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          varsIgnorePattern: "(^_+[0-9]*$)|([iI]gnored$)|(^ignored)",
          argsIgnorePattern: "(^_+[0-9]*$)|([iI]gnored$)|(^ignored)",
        },
      ],

      "no-console": [
        "error",
        {
          allow: ["warn", "error", "info", "debug"],
        },
      ],

      "@typescript-eslint/no-explicit-any": ["off"],
      "security/detect-object-injection": "off",
      "security/detect-non-literal-fs-filename": "off",

      "import/extensions": [
        "error",
        "ignorePackages",
        {
          js: "never",
          jsx: "never",
          ts: "never",
          tsx: "never",
        },
      ],
    },
  },
];
