import { setupProxy } from "./config.js";
import { Logger } from "./logger.js";

export async function create({ port: proxyPort }) {
  const startTime = performance.now();
  const logger = Logger.getLogger();
  let isServerRunning = false;

  return async function start(config) {
    const { hosts } = config;

    if (isServerRunning) {
      // Reset the proxy setup if the server is already running
      // This is a placeholder for any reset logic if needed
    } else {
      // Setup the proxy using http-proxy-middleware
      setupProxy({ target: 'http://localhost:5000', changeOrigin: true });
      isServerRunning = true;
    }

    const startUpTimeInMs = Math.round(performance.now() - startTime);
    logger.info(`Ready (${startUpTimeInMs}ms) and Willing to Serve!`);
    logger.info(`🌐 Proxy: https://localhost:${proxyPort}`);
    logger.info(`📄 Proxy pac: https://localhost:${proxyPort}/proxy.pac`);

    return {
      stop: async () => {
        // Placeholder for stopping the proxy server if needed
      }
    };
  };
}
