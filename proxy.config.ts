import { parse } from "node-html-parser";
import {
  CallbackResponseResult,
  PassThroughResponse,
} from "mockttp/dist/rules/requests/request-handler-definitions.js";

import { defineConfig } from "./src/utils.js";

export default defineConfig({
  shouldProxy(origin) {
    return origin.includes("google.com");
  },
  handleRequest(req): void {
    console.log(`[👴🏻 Malcolm] - I'll Handle This (${new URL(req.url).host})`);
  },
  async handleResponse(
    res: PassThroughResponse
  ): Promise<CallbackResponseResult | undefined> {
    if (res.headers["content-type"]?.startsWith("text/html")) {
      const resp = await res.body.getText();
      const $root = parse(resp!);
      return {
        body: Buffer.from($root.toString()),
      };
    }
    return;
  },
});
