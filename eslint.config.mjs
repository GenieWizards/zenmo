// Run this command to generate base config and vs code settings:
// pnpm dlx @antfu/eslint-config@latest

import antfu from "@antfu/eslint-config";

export default antfu(
  {
    type: "app",
    typescript: true,
    formatters: true,
    stylistic: {
      indent: 2,
      semi: true,
      quotes: "double",
    },
  },
  {
    rules: {
      "no-console": ["warn"],
      "antfu/no-top-level-await": ["off"],
      "node/prefer-global/process": ["off"],
      "node/no-process-env": ["error"],
      "perfectionist/sort-imports": [
        "error",
        {
          internalPattern: ["@/**"],
        },
      ],
      "unicorn/filename-case": [
        "error",
        {
          case: "kebabCase",
          ignore: ["README.md", "CODE_OF_CONDUCT.md", "CONTRIBUTING.md"],
        },
      ],
      "@stylistic/brace-style": ["error", "1tbs", { allowSingleLine: true }],
    },
  },
  // Override for specific folder
  {
    files: ["src/db/migrations/**/*"],
    rules: {
      "unicorn/filename-case": "off",
    },
  },
);
