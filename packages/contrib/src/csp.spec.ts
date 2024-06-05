import { test, expect } from "vitest";
import { withoutCSP } from "./csp.js";
import { buildBodyReader } from "mockttp/dist/util/request-utils";

const htmlDocument = `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" content="*">
    <title>Test Document</title>
    </head>
    <body>
        <h1>Hello World!</h1>
    </body>
</html>
`;

test("[Happy Path] - ALL_THE_THINGS™ Work.", async () => {
  const headers = {
    "content-security-policy": "VERY_PROTECTIVE_CSP",
    "x-something-else": "LEAVE_ME_ALONE",
  };
  const resp = await withoutCSP(
    {
      id: "first-thing",
      statusCode: 200,
      body: buildBodyReader(Buffer.from(htmlDocument), headers),
      headers,
      rawHeaders: Object.entries(headers),
    },
    { removeHttpEquiv: true },
  );
  const body = resp.body?.toString();
  if (body !== undefined) {
    expect(body).toContain(`<meta name="Malcolm::RemovedCSP">`);
  }
  expect(resp.headers?.["content-security-policy"]).not.toBeDefined();
  expect(resp.headers?.["x-something-else"]).toBe("LEAVE_ME_ALONE");
});
