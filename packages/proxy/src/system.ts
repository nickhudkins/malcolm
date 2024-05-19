import { mkdirSync, writeFileSync, readFileSync, existsSync } from "fs";
import { execSync } from "child_process";
import { get_active_interface as getActiveInterface } from "network";

import { platform } from "os";

import { Mockttp, generateCACertificate } from "mockttp";

import { DEFAULT_CERT_PATH, DEFAULT_CONFIG_DIR, DEFAULT_KEY_PATH } from "./constants.js";
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

export async function ensureCACertificate(): Promise<MalcolmSystemConfig["https"]> {
  // Ensure Directory Exists
  mkdirSync(DEFAULT_CONFIG_DIR, { recursive: true });

  const certExists = existsSync(DEFAULT_CERT_PATH);
  const keyExists = existsSync(DEFAULT_KEY_PATH);

  // FIXME: This should not only check that the cert exists, but that it is trusted.
  if (certExists && keyExists) {
    return {
      cert: readFileSync(DEFAULT_CERT_PATH, "utf-8"),
      key: readFileSync(DEFAULT_KEY_PATH, "utf-8"),
    };
  }

  // Generate cert
  const { key, cert } = await generateCACertificate({
    commonName: "Malcolm Cert",
    organizationName: "Nick Hudkins",
  });
  // Write the cert to disk.
  writeFileSync(DEFAULT_CERT_PATH, cert, { encoding: "utf-8" });
  writeFileSync(DEFAULT_KEY_PATH, key, { encoding: "utf-8" });

  // TODO: Cross Platform Support, and error handling.
  execSync(`sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ${DEFAULT_CERT_PATH}`);
  return { key, cert };
}

export async function prepareSystem({ hosts, server, proxyPort }: MalcolmSystemConfig) {
  // const spkiFingerprint = generateSPKIFingerprint(https.cert);
  // console.log(`[SPKI Fingerprint] - ${spkiFingerprint}`);

  const pacFileContents = await generatePacFile({ hosts, proxyPort });
  // Serve the PAC file.

  const pacFilePath = "/proxy.pac";

  server.forGet(pacFilePath).thenReply(200, pacFileContents, {
    "content-type": "application/x-ns-proxy-autoconfig",
  });

  getActiveInterface((_, { desc: interfacesName }) => {
    console.log(`Configuring [${interfacesName}]...`);

    // TODO: Cross Platform Support, and error handling.
    if (platform() === "darwin") {
      // make sure the interface is right because reasons
      const networkInterfaceName = getNetworkAliasForMac(interfacesName);

      execSync(
        `networksetup -setautoproxyurl "${networkInterfaceName}" "https://localhost:${proxyPort}${pacFilePath}"`,
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
