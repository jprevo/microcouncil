import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import sonarjs from "eslint-plugin-sonarjs";
import prettier from "eslint-config-prettier/flat";

export default tseslint.config(
  {
    ignores: ["dist/**", "skill/**", "node_modules/**", "docs/**"],
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      sonarjs.configs.recommended,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/dot-notation": [
        "error",
        { allowIndexSignaturePropertyAccess: true },
      ],
    },
  },
  {
    files: ["scripts/**/*.mjs", "*.config.{js,ts}"],
    extends: [js.configs.recommended, sonarjs.configs.recommended],
    languageOptions: {
      globals: globals.nodeBuiltin,
      sourceType: "module",
    },
  },
  {
    files: ["src/**/*.{ts,tsx}", "scripts/**/*.mjs", "*.config.{js,ts}"],
    rules: { "sonarjs/aws-restricted-ip-admin-access": "off" },
  },
  prettier,
);
