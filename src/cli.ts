#!/usr/bin/env node
import getPort from "get-port";
import { join } from "path";
import { create } from "./proxy.js";

import { DEFAULT_PROXY_PORT } from "./constants.js";
import { createFileWatcher } from "./utils.js";
import { getProxyConfig, validateUserConfig } from "./config.js";

// TODO: Accept Config Path as CLI arg
const userConfigPath = join(process.cwd(), "proxy.config.ts");

// Throws if config is missing
await validateUserConfig(userConfigPath);

// TODO: Accept Port as CLI arg
const proxyPort = await getPort({
  port: DEFAULT_PROXY_PORT,
});

const start = await create({ port: proxyPort });

async function run() {
  const config = await getProxyConfig(userConfigPath);
  await start(config);
}

await run();
createFileWatcher(userConfigPath, run);
