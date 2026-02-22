import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import globals from "globals";
import js from "@eslint/js";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  tseslint.configs.recommended,
  // Use jsx-runtime config (React 17+ automatic transform, no class-component rules)
  pluginReact.configs.flat["jsx-runtime"],
  {
    settings: {
      react: { version: "detect" },
    },
    rules: {
      // Allow `any` for GitHub API response types (warn, not error)
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow unescaped apostrophes in JSX text
      "react/no-unescaped-entities": "off",
    },
  },
]);
