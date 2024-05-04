import { getLocal, matchers, requestHandlers } from "mockttp";

import { ProxyInitializationOptions } from "./types.js";
import { prepareSystem, ensureCACertificate, malcolmHome } from "./system.js";
import { mkdirSync } from "node:fs";

export async function run({
  shouldProxy,
  proxyPort,
  handleRequest,
  handleResponse,
}: ProxyInitializationOptions) {
  // TODO: move this bu this was to unblock my usage
  // Ensure Directory Exists
  mkdirSync(malcolmHome, { recursive: true });

  const httpsOpts = await ensureCACertificate();

  const server = getLocal({ https: httpsOpts });

  /**
   * Responsible For:
   * - Generate PAC file
   * - Confiure System to use PAC file
   * - Trust generated CA cert
   */
  await prepareSystem({ shouldProxy, server, https: httpsOpts, proxyPort });

  server.addRequestRules({
    matchers: [
      // Realistically, ANYTHING that hits this proxy
      // has passed through the PAC and is already filtered,
      // but this should be able to be used WITHOUT PAC, and
      // therefore we fallback to this callback matcher
      new matchers.CallbackMatcher((req) => {
        return shouldProxy(req.url, req.url);
      }),
    ],
    handler: new requestHandlers.PassThroughHandler({
      async beforeRequest(req) {
        return handleRequest?.(req);
      },
      async beforeResponse(res) {
        return handleResponse?.(res);
      },
    }),
  });

  await server.start(proxyPort);
  console.log(
    `[👴🏻 Malcolm] - Ready and Willing to Serve! (https://localhost:${proxyPort})`,
  );
}
