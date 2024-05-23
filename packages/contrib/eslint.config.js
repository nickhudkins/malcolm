import customConfig from "config-eslint";
import tseslint from "typescript-eslint";

const config = tseslint.config(...customConfig, {
  rules: {},
});

export default config;
