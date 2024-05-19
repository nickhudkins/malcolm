import getPort from "get-port";
import { getProxyConfig } from "./config.js";
import { createFileWatcher } from "./utils.js";
import { create } from "./proxy.js";
import path from "path";

interface ProgramOptions {
  proxyPort: number;
  userConfigPath: string;
}

export async function program(opts: ProgramOptions) {
  const fullyQualifiedPath = path.resolve(opts.userConfigPath);

  const proxyPort = await getPort({
    port: opts.proxyPort,
  });

  const start = await create({ port: proxyPort });

  // Wrap up getting config and starting
  async function run() {
    const config = await getProxyConfig(fullyQualifiedPath);
    await start(config);
  }

  createFileWatcher(fullyQualifiedPath, run);
  await run();
}
