#!/usr/bin/env node
import yargs from "yargs";
import { promises as fs } from "node:fs";
import path from "node:path";
import { hideBin } from "yargs/helpers";

import { DEFAULT_PROXY_PORT, DEFAULT_PROXY_CONFIG_PATH, ENV_VAR_PREFIX, USAGE_BANNER } from "./constants.js";
import { program } from "./program.js";

// read the version from package.json
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const packageJson = JSON.parse(await fs.readFile(`${__dirname}/../package.json`, "utf-8"));

// TODO: we can do other stuff here
const gnenerateUsageBanner = () => {
  return USAGE_BANNER;
};

const { proxyPort, userConfigPath } = await yargs(hideBin(process.argv))
  .scriptName("malcolm")
  .version(packageJson.version)
  .options({
    proxyPort: {
      alias: ["p", "proxy-port"],
      number: true,
      default: DEFAULT_PROXY_PORT,
    },
    userConfigPath: {
      alias: ["c", "user-config-path"],
      default: DEFAULT_PROXY_CONFIG_PATH,
    },
  })
  .env(ENV_VAR_PREFIX)
  .usage(gnenerateUsageBanner())
  .parseAsync();

await program({
  proxyPort,
  userConfigPath,
});
