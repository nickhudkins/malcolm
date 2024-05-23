import js from "@eslint/js";
import tseslint from "typescript-eslint";

const config = tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { ignores: ["dist"], files: ["src/**/*.ts"] },
  {
    rules: {
      quotes: ["error", "double"],
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
);

export default config;
