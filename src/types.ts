import { HTMLElement } from "node-html-parser";

import { CompletedRequest } from "mockttp";
import { PassThroughResponse } from "mockttp/dist/rules/requests/request-handler-definitions";

export interface ProxyConfig {
  handleRequest?: (req: CompletedRequest) => void;
  handleResponse?: (res: PassThroughResponse) => void;
  handleParsedHTML?: (root: HTMLElement) => HTMLElement;
}

export interface ProxyInitializationOptions extends ProxyConfig {
  proxyPort: number;
}
