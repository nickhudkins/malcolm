import { CompletedRequest, MaybePromise } from "mockttp";
import {
  CallbackRequestResult,
  CallbackResponseResult,
  PassThroughResponse,
} from "mockttp/dist/rules/requests/request-handler-definitions";

export interface ProxyConfig<ContextT> {
  hosts: string[];
  shouldIntercept: (req: CompletedRequest) => boolean;
  handleRequest?: (
    req: CompletedRequest
  ) => MaybePromise<(CallbackRequestResult & { ctx?: ContextT }) | void> | void;
  handleResponse?: (
    res: PassThroughResponse,
    ctx: ContextT
  ) => MaybePromise<CallbackResponseResult | void> | void;
}

export interface ProxyInitializationOptions extends ProxyConfig<any> {
  proxyPort: number;
}
