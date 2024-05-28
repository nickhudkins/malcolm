import getPort from "get-port";
import { getProxyConfig } from "./config.js";
import { createFileWatcher } from "./utils.js";
import { create } from "./proxy.js";
import fs from "fs";
import path from "path";

import { spawn, fork } from "child_process";

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

    const f = fs.openSync("log.out", "a");
    process.on("SIGINT", async () => {
      const thing = spawn("npx tsx src/cleanup.ts", { shell: true, detached: true, stdio: ["ignore", f, f, "ipc"] });
      thing.unref();
    });
  }
  await run();
}
