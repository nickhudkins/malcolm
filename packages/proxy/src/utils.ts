import { promises as fs } from "fs";
import { createHash } from "crypto";
import { ProxyConfig } from "./types.js";

/** Helper function to define a malcolm config */
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
  return hosts.some(_ => host.endsWith(_));
}

export function noop() {}

async function getFileHash(filePath: string) {
  const fileBuffer = await fs.readFile(filePath);
  return createHash("md5").update(fileBuffer).digest("hex");
}

function withResolvers() {
  let resolve!: (_: unknown) => void;
  let reject!: (_: unknown) => void;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return {
    resolve,
    reject,
    promise,
  };
}

export function createFileWatcher(filePath: string, onChange: () => void) {
  const ac = new AbortController();
  const { promise, resolve } = withResolvers();
  (async () => {
    try {
      const configWatcher = fs.watch(filePath, { signal: ac.signal });
      let previousFileHash = getFileHash(filePath);

      for await (const event of configWatcher) {
        if (event.eventType !== "change") continue;
        const newFileHash = getFileHash(filePath);
        if (previousFileHash !== newFileHash) {
          onChange();
          previousFileHash = newFileHash;
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        console.log("Stopped file watcher");
        resolve({});
      }
    }
  })();

  return () => {
    console.log("Stopping file watcher");
    ac.abort();

    return promise;
  };
}
