#!/usr/bin/env node
import getPort from "get-port";
import { join } from "path";
import { run } from "./proxy.js";
import { tsImport } from "tsx/esm/api";
import { promises as fs } from "fs";
import { DEFAULT_PROXY_PORT } from "./constants.js";

const proxyPort = await getPort({
  port: DEFAULT_PROXY_PORT,
});

// create the server
const configure = await run();

function noop() { }

async function loadConfig() {

  const userConfig = await tsImport(userConfigPath, import.meta.url);

  const {
    default: {
      handleRequest = noop,
      handleResponse = noop,
      shouldIntercept,
      hosts = [],
    },
  } = userConfig;

  await configure({
    hosts,
    proxyPort,
    shouldIntercept,
    handleResponse,
    handleRequest,
  });

}

const userConfigPath = join(process.cwd(), "proxy.config.ts");
await loadConfig()

// attach a watcher to this file
try {
  const configWatcher = fs.watch(userConfigPath);
  for await (const event of configWatcher) {
    if (event.eventType !== "change") continue;
    loadConfig()
  }
} catch (err: any) {
  if (err.name === "AbortError") throw err;
}
