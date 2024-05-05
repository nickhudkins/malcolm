import { ProxyConfig } from "./types.js";

export function defineConfig<ContextT>(config: ProxyConfig<ContextT>) {
  return config;
}

/**
 * Function that is used for the PAC file,
 * and determines whether or not to proxy a request
 * based on the host. It is also used for the mockttp
 * CallbackMatcher so that the same requests that make
 * it through the PAC filter, also make it into our request
 * handlers. Otherwise we will end up with unmatched routes.
 */
export function pacFilterFunction(hosts: string[], host: string) {
  return hosts.some((_) => host.endsWith(_));
}
