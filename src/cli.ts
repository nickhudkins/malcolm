#!/usr/bin/env tsx
import getPort from "get-port";
import { run } from "./proxy.js";
import { tsImport } from "tsx/esm/api";

const proxyPort = await getPort({
  port: 6969,
});

function noop() { }

const cwd = process.cwd();
const module = await tsImport(`${cwd}/proxy.config.ts`, cwd);

const {
  default: { handleRequest = noop, handleResponse = noop, shouldProxy },
} = module;

await run({
  proxyPort,
  shouldProxy,
  handleResponse,
  handleRequest,
});
