import chalk from "chalk";
import { homedir } from "os";
import { join } from "path";

const home = homedir();
export const DEFAULT_CONFIG_DIR = join(home, ".malcolm");

export const DEFAULT_CERT_PATH = join(DEFAULT_CONFIG_DIR, "malcom-cert.pem");
export const DEFAULT_KEY_PATH = join(DEFAULT_CONFIG_DIR, "malcolm-key.pem");

export const DEFAULT_PROXY_PORT = 6969;

export const LOG_PREFIX = "[" + chalk.yellow(`👴🏻 Malcolm`) + "]";

// Errors!
export const ConfigurationMissingErrorName = "ConfigurationMissingError";
