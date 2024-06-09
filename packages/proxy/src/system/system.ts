import { Mockttp, generateCACertificate } from "mockttp";

import { pacFilterFunction } from "../utils.js";
import { get_active_interface as getActiveInterface } from "network";
import { execSync } from "child_process";
import { Logger } from "../logger.js";
import {
  DEFAULT_CERT_COMMON_NAME,
  DEFAULT_CERT_PATH,
  DEFAULT_CONFIG_DIR,
  DEFAULT_KEY_PATH,
  PAC_FILE_PATH,
} from "../constants.js";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";

interface GeneratePacFileInput {
  proxyPort: number;
  hosts: string[];
}
export interface MalcolmSystemConfig {
  proxyPort: number;
  server: Mockttp;
  hosts: string[];
  https: {
    cert: string;
    key: string;
  };
}

export interface MalcolmSystemFunctions {
  buildRemoveCertificateCommand: (certName: string) => string;
  buildTrustCertificateCommand: (certName: string) => string;
  buildSetProxyCommand: (networkInterfaceName: string, proxyPort: MalcolmSystemConfig["proxyPort"]) => string;
  buildUnsetProxyCommand: (networkInterfaceName: string) => string;
  getNetworkInterfaceName: (interfaceName: string) => string;
}

let osFunctions: MalcolmSystemFunctions;
switch (process.platform) {
  case "darwin":
    osFunctions = require("./darwin.js");
    break;
  case "linux":
    osFunctions = require("./linux.js");
    break;
  default:
    throw new Error("Specified platform is not supported! Sorry!");
}

export async function generatePacFile({ hosts, proxyPort }: GeneratePacFileInput): Promise<string> {
  return `function FindProxyForURL(url, host) {
    ${pacFilterFunction};
    if (${pacFilterFunction.name}(${JSON.stringify(hosts)}, host)) {
      return 'PROXY localhost:${proxyPort}; DIRECT';
    }
    return 'DIRECT';
  }`;
}

export async function ensureCACertificate() {
  const logger = Logger.getLogger();
  // Ensure Directory Exists
  mkdirSync(DEFAULT_CONFIG_DIR, { recursive: true });

  const certExists = existsSync(DEFAULT_CERT_PATH);
  const keyExists = existsSync(DEFAULT_KEY_PATH);

  // FIXME: This should not only check that the cert exists, but that it is trusted.
  if (certExists && keyExists) {
    logger.info("🔐 CA Certificate already exists, skipping generation...");
    return {
      cert: readFileSync(DEFAULT_CERT_PATH, "utf-8"),
      key: readFileSync(DEFAULT_KEY_PATH, "utf-8"),
    };
  }

  logger.info("🔐 CA Certificate don't exist, generating...");
  // Generate cert
  const { key, cert } = await generateCACertificate({
    commonName: DEFAULT_CERT_COMMON_NAME,
    organizationName: "Nick Hudkins",
  });

  // Write the cert to disk.
  writeFileSync(DEFAULT_CERT_PATH, cert, { encoding: "utf-8" });
  writeFileSync(DEFAULT_KEY_PATH, key, { encoding: "utf-8" });

  // TODO: Cross Platform Support, and error handling.
  trustCACertificate();
  return { key, cert };
}

export async function prepareSystem({ hosts, server, proxyPort }: MalcolmSystemConfig): Promise<void> {
  // const spkiFingerprint = generateSPKIFingerprint(https.cert);
  // console.log(`[SPKI Fingerprint] - ${spkiFingerprint}`);
  const pacFileContents = await generatePacFile({ hosts, proxyPort });

  // Serve the PAC file.
  server.forGet(PAC_FILE_PATH).thenReply(200, pacFileContents, {
    "content-type": "application/x-ns-proxy-autoconfig",
  });

  return new Promise((resolve, reject) => {
    getActiveInterface((err, { desc: interfacesName }) => {
      if (err) {
        reject(err);
        return;
      }

      const networkInterfaceName = osFunctions.getNetworkInterfaceName(interfacesName);
      execSync(osFunctions.buildSetProxyCommand(networkInterfaceName, proxyPort));
      resolve();
    });
  });
}

export function removeCACertificate() {
  const logger = Logger.getLogger();
  logger.info("↩️ Removing CA Certificate, this requires sudo to untrust the cert...");

  rmSync(DEFAULT_CERT_PATH);
  rmSync(DEFAULT_KEY_PATH);

  execSync(osFunctions.buildRemoveCertificateCommand(DEFAULT_CERT_COMMON_NAME), { stdio: "inherit" });
}

function trustCACertificate() {
  const logger = Logger.getLogger();
  // TODO: handle error
  logger.info("🔐 Trusting CA Certificate, this requires sudo to trust the cert...");
  execSync(osFunctions.buildTrustCertificateCommand(DEFAULT_CERT_COMMON_NAME), { stdio: "inherit" });
  logger.info("🔐 Done Trusting CA Certificate");
}

export async function unsetProxy(): Promise<void> {
  const logger = Logger.getLogger();

  return new Promise((resolve, reject) => {
    getActiveInterface((err, { desc: interfacesName }) => {
      if (err) {
        reject(err);
        return;
      }

      const networkInterfaceName = osFunctions.getNetworkInterfaceName(interfacesName);
      execSync(osFunctions.buildUnsetProxyCommand(networkInterfaceName));

      logger.info(`Proxy removed from [${interfacesName}]`);
      resolve();
    });
  });
}
