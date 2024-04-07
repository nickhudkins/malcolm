import { CompletedRequest } from "mockttp";
import { PassThroughResponse } from "mockttp/dist/rules/requests/request-handler-definitions";

export interface ProxyConfig {
  shouldProxy: (url: string, host: string) => boolean;
  handleRequest?: (req: CompletedRequest) => void;
  handleResponse?: (res: PassThroughResponse) => void;
}

export interface ProxyInitializationOptions extends ProxyConfig {
  proxyPort: number;
}
