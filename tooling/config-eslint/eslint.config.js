import js from "@eslint/js";
import tseslint from "typescript-eslint";

const config = tseslint.config(
  js.configs.recommended,
  { ignores: ["dist/"] },
  {
    rules: {
      "no-unused-vars": "warn",
    },
  },
);

export default config;
