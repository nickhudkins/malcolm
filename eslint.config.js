import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

// NOTE: v9 is way diff
// https://eslint.org/blog/2022/08/new-config-system-part-1/
// https://eslint.org/blog/2022/08/new-config-system-part-2/

/** @type {import('typescript-eslint').Config} */
export default [
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];
