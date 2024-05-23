import js from "@eslint/js";
import tseslint from "typescript-eslint";

const config = tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { ignores: ["dist/"], files: ["src/**/*.ts"] },
  {
    rules: {
      "no-unused-vars": "warn",
      quotes: ["error", "double"],
    },
  },
);

export default config;
