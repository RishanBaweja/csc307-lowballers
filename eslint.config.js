import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import pluginPrettier from "eslint-plugin-prettier";
import configPrettier from "eslint-config-prettier";

export default [
  // Global ignore patterns
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/build/**"],
  },

  // Base configuration for all JavaScript files
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      ...configPrettier.rules,
      "prettier/prettier": "error",
    },
  },

  // Backend-specific configuration
  {
    files: ["packages/express-backend/**/*.js"],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      "no-console": "off", // Allow console.log in backend
    },
  },

  // Frontend-specific configuration
  {
    files: ["packages/react-frontend/**/*.{js,jsx}"],
    ...pluginReact.configs.flat.recommended,
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      // React-specific rules
      "react/prop-types": "warn", // Change from error to warning
      "react/react-in-jsx-scope": "off", // Not needed in React 17+

      // Custom rules examples
      "no-unused-vars": "error",
      "no-console": "warn", // Warn about console.log in frontend
      "prefer-const": "error",
      "no-var": "error",
    },
  },
];
