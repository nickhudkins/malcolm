import {
  generateCACertificate,
  // Can use to trust!
  generateSPKIFingerprint,
  getLocal,
  matchers,
  requestHandlers,
} from "mockttp";
import { parse } from "node-html-parser";

import { ProxyInitializationOptions } from "./types.js";

export async function run({
  proxyPort,
  handleParsedHTML,
  handleRequest,
  handleResponse,
}: ProxyInitializationOptions) {
  // TODO: Trust these certs bro.
  const https = await generateCACertificate();
  const server = getLocal({ https });

  server.addRequestRules({
    matchers: [new matchers.HostMatcher("www.google.com")],
    handler: new requestHandlers.PassThroughHandler({
      async beforeRequest(req) {
        handleRequest?.(req);
      },
      async beforeResponse(res) {
        handleResponse?.(res);
        const resp = await res.body.getText();
        const $root = handleParsedHTML?.(parse(resp!))!;
        return {
          rawBody: Buffer.from($root.toString()),
        };
      },
    }),
  });

  await server.start(proxyPort);
}
