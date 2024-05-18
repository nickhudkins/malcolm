import { tsImport } from "tsx/esm/api";
import { existsSync } from "fs";
import { noop } from "./utils.js";
import { ProxyInitializationOptions } from "./types.js";
import { ConfigurationMissingErrorName } from "./constants.js";

export async function getProxyConfig(
  configPath: string
): Promise<ProxyInitializationOptions> {
  const userConfig = await tsImport(configPath, import.meta.url);
  const {
    default: {
      handleRequest = noop,
      handleResponse = noop,
      shouldIntercept,
      hosts = [],
    },
  } = userConfig;
  return {
    hosts,
    shouldIntercept,
    handleResponse,
    handleRequest,
  };
}

// TODO: Maybe ACTUALLY validate the config?
export async function validateUserConfig(filePath: string) {
  if (existsSync(filePath)) {
    return;
  }
  throw new ConfigurationMissingError();
}

class ConfigurationMissingError extends Error {
  constructor() {
    super(
      `[${ConfigurationMissingErrorName}]: Please ensure a \`proxy.config.ts\` file is present.`
    );
    this.name = ConfigurationMissingErrorName;
  }
}
