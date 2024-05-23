import * as https from "https";
import { vi, test, expect } from "vitest";

import { create } from "./proxy.js";
import getPort from "get-port";
import { HttpsProxyAgent } from "https-proxy-agent";

// Acceptable security risk as we're running tests
// against well known, mocked endpoints
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

test("It Works!", async () => {
  const proxyPort = await getPort({
    port: 6969,
  });
  const get = (url: string) => {
    return new Promise<void>((resolve, _reject) => {
      const agent = new HttpsProxyAgent(`http://localhost:${proxyPort}`);

      https.get(url, { agent }, () => {
        resolve();
      });
    });
  };

  const handleRequest = vi.fn();
  const handleResponse = vi.fn();

  const start = await create({ port: proxyPort });

  await start({
    handleRequest,
    handleResponse,
    hosts: ["google.com"],
    shouldIntercept: () => true,
  });

  await get("https://www.google.com");

  expect(handleRequest).toHaveBeenCalled();
  expect(handleResponse).toHaveBeenCalled();
});
