import { parse } from "node-html-parser";
import {
  CallbackResponseResult,
  PassThroughResponse,
} from "mockttp/dist/rules/requests/request-handler-definitions.js";

import { defineConfig } from "./src/utils.js";

export default defineConfig({
  shouldProxy(origin) {
    return origin.includes("console.aws.amazon.com");
  },
  handleRequest(req): void {
    console.log(`[👴🏻 Malcolm] - I'll Handle This (${new URL(req.url).host})`);
  },
  async handleResponse(
    res: PassThroughResponse,
  ): Promise<CallbackResponseResult | undefined> {
    if (res.headers["content-type"]?.startsWith("text/html")) {
      const resp = await res.body.getText();
      const $root = parse(resp!);
      const $tbData = $root.querySelector('meta[name="tb-data"]');

      // strip the CSP meta tag
      const $csp = $root.querySelector('meta[http-equiv="Content-Security-Policy"]');
      $csp?.remove();

      if (!$tbData) {
        return;
      }

      // parse the metatag and add a new property to it then
      const tbData = JSON.parse($tbData?.getAttribute("content")!);
      tbData["custom"]["ucafDev"] = true;
      delete tbData["telemetry"];

      $tbData?.setAttribute("content", JSON.stringify(tbData));

      return {
        body: Buffer.from($root.toString()),
      };
    }
    return;
  },
});
