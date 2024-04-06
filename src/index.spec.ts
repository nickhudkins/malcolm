import { vi, test, expect } from "vitest";

import { run } from "./proxy.js";
import getPort from "get-port";

test("It Works!", async () => {
  const proxyPort = await getPort({
    port: 6969,
  });

  const tlsTerminatorPort = await getPort({
    port: 6443,
  });

  const handleRequest = vi.fn();
  const handleParsedHTML = vi
    .fn()
    .mockImplementation((root) => (root.innerHTML = "LOL"));
  const handleResponse = vi.fn();

  await run({
    proxyPort,
    tlsTerminatorPort,
    handleRequest,
    handleParsedHTML,
    handleResponse,
  });

  process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

  await fetch(`https://localhost:${tlsTerminatorPort}`, {
    headers: {
      Origin: "https://www.google.com",
    },
  });

  expect(handleRequest).toHaveBeenCalled();
  expect(handleParsedHTML).toHaveBeenCalled();
  expect(handleResponse).toHaveBeenCalled();
});
