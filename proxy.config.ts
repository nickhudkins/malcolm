import { parse } from "node-html-parser";
import {
  CallbackResponseResult,
  PassThroughResponse,
} from "mockttp/dist/rules/requests/request-handler-definitions.js";

import { defineConfig } from "./src/utils.js";

export default defineConfig({
  shouldProxy(url) {
    return url.includes("google");
  },
  handleRequest(req): void {
    console.log(`[👴🏻 Malcolm] - I'll Handle This (${req.url})`);
  },
  async handleResponse(
    res: PassThroughResponse
  ): Promise<CallbackResponseResult> {
    const resp = await res.body.getText();
    const $root = parse(resp!);
    return {
      rawBody: Buffer.from($root.toString()),
    };
  },
});
