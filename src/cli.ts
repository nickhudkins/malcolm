#!/usr/bin/env node
import path from "path";
import getPort from "get-port";
import { run } from "./proxy.js";
import { ProxyConfig } from "./types.js";
import {
  DEFAULT_PROXY_PORT,
  DEFAULT_TLS_TERMINATON_PORT,
} from "./constants.js";

export const proxyPort = await getPort({
  port: DEFAULT_PROXY_PORT,
});

export const tlsTerminatorPort = await getPort({
  port: DEFAULT_TLS_TERMINATON_PORT,
});

function noop() {}

//TODO: Discover Config differently than this lol
const {
  default: { handleParsedHTML, handleRequest = noop, handleResponse = noop },
  // TODO: We need to solve this in build mode, not sure if it's "easy" to support TS initially
} = (await import(path.join(process.cwd(), "proxy.config.ts"))) as {
  default: ProxyConfig;
};

await run({
  proxyPort,
  tlsTerminatorPort,
  handleParsedHTML,
  handleResponse,
  handleRequest,
});
