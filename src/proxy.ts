import { spawn } from "child_process";
import { parse } from "node-html-parser";
import http from "http";

import {
  createProxyMiddleware,
  responseInterceptor,
} from "http-proxy-middleware";
import { ProxyInitializationOptions } from "./types.js";

export async function run({
  proxyPort,
  tlsTerminatorPort,
  handleRequest,
  handleResponse,
  handleParsedHTML,
}: ProxyInitializationOptions) {
  return new Promise<void>((resolve) => {
    const server = http.createServer(function (req, res) {
      if (!req.headers.origin) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("No Origin Header: please provide an origin header.");
        return;
      }

      const middleware = createProxyMiddleware({
        target: req.headers.origin,
        changeOrigin: true,
        selfHandleResponse: true,
        on: {
          proxyReq: (proxyReq, req, res, options) => {
            handleRequest(proxyReq, req, res, options);
          },
          proxyRes: responseInterceptor(async (responseBuffer, proxyRes) => {
            handleResponse(proxyRes, res);
            // TODO: Check if it's something needing responsing, then do it.
            if (proxyRes.headers["content-type"]?.startsWith("text/html")) {
              const response = responseBuffer.toString("utf8"); // convert buffer to string
              const root = parse(response);
              return handleParsedHTML(root).toString();
            }
            return responseBuffer;
          }),
        },
      });
      middleware(req, res);
    });

    server.listen(proxyPort, () => {
      const caddyProc = spawn("caddy", [
        `reverse-proxy`,
        `--from`,
        `localhost:${tlsTerminatorPort}`,
        `--to`,
        `localhost:${proxyPort}`,
      ]);
      caddyProc.stdout.on("data", (chunk) => console.log(chunk.toString()));
      resolve();
    });
  });
}
