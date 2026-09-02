import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import sonarjs from "eslint-plugin-sonarjs";
import prettier from "eslint-config-prettier/flat";

export default tseslint.config(
  {
    // Artefacts de build et dépendances : jamais analysés.
    ignores: ["dist/**", "skill/**", "node_modules/**", "docs/**"],
  },

  // Sources de l'application (TypeScript typé, React).
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
          // `const { label, ...item } = entry` reste la façon lisible d'omettre un champ.
          ignoreRestSiblings: true,
        },
      ],
      // Les relectures défensives de JSON passent par une signature d'index :
      // `record["name"]` y dit mieux « clé inconnue » que `record.name`.
      "@typescript-eslint/dot-notation": [
        "error",
        { allowIndexSignaturePropertyAccess: true },
      ],
    },
  },

  // Scripts Node et configuration Vite : pas de React, environnement Node.
  {
    files: ["scripts/**/*.mjs", "*.config.{js,ts}"],
    extends: [js.configs.recommended, sonarjs.configs.recommended],
    languageOptions: {
      globals: globals.nodeBuiltin,
      sourceType: "module",
    },
  },

  // Prettier en dernier : neutralise toutes les règles de mise en forme.
  prettier,
);
