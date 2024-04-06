import type { IncomingMessage, OutgoingMessage } from "http";
import { defineConfig } from "./src/utils.js";

export default defineConfig({
  handleRequest(_, req, __): void {
    console.log(`[🖕] I'll Handle This (${req.headers.origin})`);
  },
  handleResponse(_proxyRes: IncomingMessage, _res: OutgoingMessage): void {},
  handleParsedHTML(root) {
    const [html] = root.getElementsByTagName("html");
    html.innerHTML = "look we can do things to patch content 🥳";

    return html;
  },
});
