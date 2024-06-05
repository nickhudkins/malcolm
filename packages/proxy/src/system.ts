import { mkdirSync, writeFileSync, rmSync, readFileSync, existsSync } from "fs";
import { execSync } from "child_process";
import { get_active_interface as getActiveInterface } from "network";
import { platform } from "os";

import { Mockttp, generateCACertificate } from "mockttp";

import {
  DEFAULT_CERT_COMMON_NAME,
  DEFAULT_CERT_PATH,
  DEFAULT_CONFIG_DIR,
  DEFAULT_KEY_PATH,
  PAC_FILE_PATH,
} from "./constants.js";
import { pacFilterFunction } from "./utils.js";

interface GeneratePacFileInput {
  proxyPort: number;
  hosts: string[];
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

interface MalcolmSystemConfig {
  proxyPort: number;
  server: Mockttp;
  hosts: string[];
  https: {
    cert: string;
    key: string;
  };
}

export function removeCACertificate() {
  console.log("↩️ Removing CA Certificate, this requires sudo to untrust the cert...");
  // remove from the file system too
  rmSync(DEFAULT_CERT_PATH);
  rmSync(DEFAULT_KEY_PATH);

  // TODO: error handle and cross platform support
  execSync(`sudo security delete-certificate -c "${DEFAULT_CERT_COMMON_NAME}"`, {
    stdio: "inherit",
  });
}

function trustCACertificate() {
  // TODO: handle error and cross platform support
  console.log("🔐 Trusting CA Certificate, this requires sudo to trust the cert...");
  execSync(`sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ${DEFAULT_CERT_PATH}`);
  console.log("🔐 Done Trusting CA Certificate");
}

export async function ensureCACertificate(): Promise<MalcolmSystemConfig["https"]> {
  // Ensure Directory Exists
  mkdirSync(DEFAULT_CONFIG_DIR, { recursive: true });

  const certExists = existsSync(DEFAULT_CERT_PATH);
  const keyExists = existsSync(DEFAULT_KEY_PATH);

  // FIXME: This should not only check that the cert exists, but that it is trusted.
  if (certExists && keyExists) {
    console.log("🔐 CA Certificate already exists, skipping generation...");
    return {
      cert: readFileSync(DEFAULT_CERT_PATH, "utf-8"),
      key: readFileSync(DEFAULT_KEY_PATH, "utf-8"),
    };
  }

  console.log("🔐 CA Certificate don't exist, generating...");
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

export async function prepareSystem({ hosts, server, proxyPort }: MalcolmSystemConfig) {
  // const spkiFingerprint = generateSPKIFingerprint(https.cert);
  // console.log(`[SPKI Fingerprint] - ${spkiFingerprint}`);

  const pacFileContents = await generatePacFile({ hosts, proxyPort });
  // Serve the PAC file.

  server.forGet(PAC_FILE_PATH).thenReply(200, pacFileContents, {
    "content-type": "application/x-ns-proxy-autoconfig",
  });

  getActiveInterface((_, { desc: interfacesName }) => {
    // TODO: Cross Platform Support, and error handling.
    if (platform() === "darwin") {
      // make sure the interface is right because reasons
      const networkInterfaceName = getNetworkAliasForMac(interfacesName);

      execSync(
        `networksetup -setautoproxyurl "${networkInterfaceName}" "https://localhost:${proxyPort}${PAC_FILE_PATH}"`,
      );
    }
  });
}

export function getNetworkAliasForMac(networkName: string) {
  const allNetworkIntefaces = execSync("networksetup -listnetworkserviceorder | tail -n+2").toString().split(/^\n/im);

  let cleanedName;
  allNetworkIntefaces.filter(networkInterface => {
    const foundInterace = networkInterface.includes(networkName);

    if (foundInterace) {
      const [firstLine] = networkInterface.split("\n");

      // clean the first line, remove the prefix
      cleanedName = firstLine.replace(/\(\d+\)\s+/gim, "");
    }
  });

  return cleanedName;
}

export async function unsetProxy(): Promise<void> {
  return new Promise((resolve, _) => {
    getActiveInterface((err, { desc: interfacesName }) => {
      if (err) {
        console.error(err);
        return;
      }

      // TODO: Cross Platform Support, and error handling.
      if (platform() === "darwin") {
        // make sure the interface is right because reasons
        const networkInterfaceName = getNetworkAliasForMac(interfacesName);

        const command = `networksetup -setautoproxyurl "${networkInterfaceName}" "off"`;
        execSync(command);

        console.log(`Proxy removed from [${interfacesName}]`);
        resolve();
      }
    });
  });
}
