#!/usr/bin/env node
import getPort from "get-port";
import { join } from "path";
import { run } from "./proxy.js";
import { tsImport } from "tsx/esm/api";
import { DEFAULT_PROXY_PORT } from "./constants.js";

const proxyPort = await getPort({
  port: DEFAULT_PROXY_PORT,
});

function noop() {}

const userConfigPath = join(process.cwd(), "proxy.config.ts");
const userConfig = await tsImport(userConfigPath, import.meta.url);

const {
  default: { handleRequest = noop, handleResponse = noop, shouldProxy },
} = userConfig;

await run({
  proxyPort,
  shouldProxy,
  handleResponse,
  handleRequest,
});
