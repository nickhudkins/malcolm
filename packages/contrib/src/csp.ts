import { PassThroughResponse } from "mockttp/dist/rules/requests/request-handler-definitions";
import { CallbackResponseMessageResult } from "mockttp/dist/rules/requests/request-handler-definitions";

interface WithoutCSPOptions {
  removeHttpEquiv: boolean;
}
export async function withoutCSP(
  resp: PassThroughResponse,
  opts?: WithoutCSPOptions,
): Promise<CallbackResponseMessageResult> {
  // Omit the CSP Header.
  const { ["content-security-policy"]: _, ...headers } = resp.headers;

  // Strip the `http-equiv` tag
  if (opts?.removeHttpEquiv) {
    return resp.body.getText().then(body => {
      if (body) {
        const newBodyStr = body.replace(
          /(http-equiv="Content-Security-Policy")\s+content="(.*)"/gim,
          'name="Malcolm::RemovedCSP"',
        );
        return {
          body: newBodyStr,
          headers,
        };
      }
      return {
        body: resp.body.buffer,
        headers,
      };
    });
  }
  return {
    body: resp.body.buffer,
    headers,
  };
}
