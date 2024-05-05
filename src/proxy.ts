import { getLocal, matchers, requestHandlers } from "mockttp";

import { ProxyInitializationOptions } from "./types.js";
import { prepareSystem, ensureCACertificate } from "./system.js";
import { pacFilterFunction } from "./utils.js";
import chalk from "chalk";
import { LOG_PREFIX } from "./constants.js";

export async function run({
  hosts,
  shouldIntercept,
  proxyPort,
  handleRequest,
  handleResponse,
}: ProxyInitializationOptions) {
  const httpsOpts = await ensureCACertificate();

  const server = getLocal({ https: httpsOpts });

  const requestCtx = new Map<string, any>();
  const skipRequestMap = new Map<string, boolean>();

  /**
   * Responsible For:
   * - Generate PAC file
   * - Confiure System to use PAC file
   * - Trust generated CA cert
   */
  await prepareSystem({ hosts, server, https: httpsOpts, proxyPort });

  server.addRequestRules({
    matchers: [
      // Realistically, ANYTHING that hits this proxy
      // has passed through the PAC and is already filtered,
      // but this should be able to be used WITHOUT PAC, and
      // therefore we fallback to this callback matcher.
      new matchers.CallbackMatcher((req) => {
        const { host } = new URL(req.url);
        return pacFilterFunction(hosts, host);
      }),
    ],
    handler: new requestHandlers.PassThroughHandler({
      async beforeRequest(req) {
        if (!shouldIntercept(req)) {
          skipRequestMap.set(req.id, true);
          return;
        }
        // TODO: I am not a fan of this, this feels really gross.
        const handleRequestOutput = await handleRequest?.(req);
        if (handleRequestOutput && "ctx" in handleRequestOutput) {
          requestCtx.set(req.id, handleRequestOutput.ctx);
          delete handleRequestOutput.ctx;
        }
        return handleRequestOutput;
      },
      async beforeResponse(res) {
        try {
          // If we skipped this request, we don't want to handle it
          if (skipRequestMap.get(res.id)) {
            skipRequestMap.delete(res.id);
            return;
          }
          const ctx = requestCtx.get(res.id);
          return handleResponse?.(res, ctx);
        } finally {
          // Cleanup request context
          requestCtx.delete(res.id);
        }
      },
    }),
  });

  await server.start(proxyPort);
  console.log(
    `${LOG_PREFIX} - ${chalk.green(
      `Ready and Willing to Serve!`
    )} (${chalk.blue(`https://localhost:${proxyPort}`)})`
  );
}
