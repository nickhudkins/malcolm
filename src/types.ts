import {
  ClientRequest,
  type IncomingMessage,
  type OutgoingMessage,
} from "http";
import { HTMLElement } from "node-html-parser";
import { ServerOptions } from "http-proxy";

export interface ProxyConfig {
  handleRequest: (
    proxyReq: ClientRequest,
    req: IncomingMessage,
    res: OutgoingMessage,
    options: ServerOptions
  ) => void;
  handleResponse: (proxyRes: IncomingMessage, res: OutgoingMessage) => void;
  handleParsedHTML: (root: HTMLElement) => HTMLElement;
}

export interface ProxyInitializationOptions extends ProxyConfig {
  proxyPort: number;
  tlsTerminatorPort: number;
}
