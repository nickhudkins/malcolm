import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { version } from "../package.json";

import { DEFAULT_PROXY_PORT, DEFAULT_PROXY_CONFIG_PATH, ENV_VAR_PREFIX, USAGE_BANNER } from "./constants.js";
import { program } from "./program.js";

const { proxyPort, userConfigPath } = await yargs(hideBin(process.argv))
  .scriptName("malcolm")
  .version(version)
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
  .usage(USAGE_BANNER)
  .parseAsync();

await program({
  proxyPort,
  userConfigPath,
});
