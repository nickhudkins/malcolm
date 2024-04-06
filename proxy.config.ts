import type { IncomingMessage, OutgoingMessage } from "http";
import { defineConfig } from "./src/utils.js";

export default defineConfig({
  handleRequest(_, req, __): void {
    console.log(`[🖕] I'll Handle This (${req.headers.origin})`);
    // D
  },
  handleResponse(proxyRes: IncomingMessage, res: OutgoingMessage): void {},
  handleParsedHTML(root) {
    return root;
  },
});
