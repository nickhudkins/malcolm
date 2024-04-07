import * as https from "https";
import { vi, test, expect } from "vitest";

import { run } from "./proxy.js";
import getPort from "get-port";
import { HttpsProxyAgent } from "https-proxy-agent";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

test("It Works!", async () => {
  const proxyPort = await getPort({
    port: 6969,
  });
  const get = (url: string) => {
    return new Promise<void>((resolve, reject) => {
      const agent = new HttpsProxyAgent(`http://localhost:${proxyPort}`);

      https.get(url, { agent }, (res) => {
        resolve();
      });
    });
  };

  const handleRequest = vi.fn();

  const handleParsedHTML = vi
    .fn()
    .mockImplementation((root) => (root.innerHTML = "LOL"));

  const handleResponse = vi.fn();

  await run({
    proxyPort,
    handleRequest,
    handleResponse,
    handleParsedHTML,
  });

  await get("https://www.google.com");

  expect(handleRequest).toHaveBeenCalled();
  expect(handleParsedHTML).toHaveBeenCalled();
  expect(handleResponse).toHaveBeenCalled();
});
