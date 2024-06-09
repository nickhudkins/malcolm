import getPort from "get-port";
import { getProxyConfig } from "./config.js";
import { createFileWatcher } from "./utils.js";
import { create } from "./proxy.js";
import path from "path";
import { unsetProxy, removeCACertificate } from "./system/system.js";

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

  const stopWatching = createFileWatcher(fullyQualifiedPath, run);
  // Wrap up getting config and starting
  async function run() {
    const config = await getProxyConfig(fullyQualifiedPath);
    const server = await start(config);

    // TODO: error handle these funky funcs
    process.on("SIGINT", async () => {
      // unset the proxy
      await unsetProxy();

      // stop the server
      await server.stop();

      // stop file watching
      await stopWatching();

      // remove the CA cert
      removeCACertificate();

      process.exit(0);
    });
  }

  await run();
}
