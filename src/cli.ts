#!/usr/bin/env tsx
import path from "path";
import getPort from "get-port";
import { run } from "./proxy.js";
import { ProxyConfig } from "./types.js";

const proxyPort = await getPort({
  port: 6969,
});

const tlsTerminatorPort = await getPort({
  port: 6443,
});

function noop() {}

//TODO: Discover Config differently than this lol
const {
  default: { handleParsedHTML, handleRequest = noop, handleResponse = noop },
} = (await import(path.join(process.cwd(), "proxy.config.js"))) as {
  default: ProxyConfig;
};

await run({
  proxyPort,
  tlsTerminatorPort,
  handleParsedHTML,
  handleResponse,
  handleRequest,
});
