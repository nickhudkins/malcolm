import path from "path";
import os from "os";
import { mkdirSync, writeFileSync, readFileSync, statfsSync } from "fs";
import { execSync } from "child_process";
import {
  Mockttp,
  generateCACertificate,
  generateSPKIFingerprint,
} from "mockttp";

interface GeneratePacFileInput {
  proxyPort: number;
  shouldProxy(url: string, host: string): boolean;
}

export async function generatePacFile({
  shouldProxy,
  proxyPort,
}: GeneratePacFileInput): Promise<string> {
  console.log(`[PAC] - ${shouldProxy}`);
  return `function FindProxyForURL(url, host) {
    function ${shouldProxy};
    if (shouldProxy(url, host)) {
      return 'PROXY localhost:${proxyPort}; DIRECT';
    }
    return 'DIRECT';
  }`;
}

interface MalcolmSystemConfig {
  proxyPort: number;
  server: Mockttp;
  shouldProxy(url: string, host: string): boolean;
  https: {
    cert: string;
    key: string;
  };
}

const home = os.homedir();
export const malcolmHome = path.join(home, ".malcolm");

// TODO: This function is absolute garbage. Fix it Nick.
export async function ensureCACertificate(): Promise<
  MalcolmSystemConfig["https"]
> {
  const certPath = path.join(malcolmHome, "malcom-cert.pem");
  const keyPath = path.join(malcolmHome, "malcolm-key.pem");
  try {
    const certExists = Boolean(statfsSync(certPath));
    const keyExists = Boolean(statfsSync(keyPath));
    if (certExists && keyExists) {
      return {
        cert: readFileSync(certPath, "utf-8"),
        key: readFileSync(keyPath, "utf-8"),
      };
    }
  } catch (e) {
    const { key, cert } = await generateCACertificate({
      commonName: "Malcolm Cert",
    });
    writeFileSync(certPath, cert, { encoding: "utf-8" });
    writeFileSync(keyPath, key, { encoding: "utf-8" });
    execSync(`security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ${certPath}`);
    return { key, cert };
  }
  // LOL absolutely not.
  return {
    cert: "",
    key: "",
  };
}

export async function prepareSystem({
  shouldProxy,
  server,
  proxyPort,
  https,
}: MalcolmSystemConfig) {
  // Ensure Directory Exists
  mkdirSync(malcolmHome, { recursive: true });

  const spkiFingerprint = generateSPKIFingerprint(https.cert);
  console.log(`[SPKI Fingerprint] - ${spkiFingerprint}`);

  const pacFileContents = await generatePacFile({ shouldProxy, proxyPort });
  // Serve the PAC file.

  const pacFilePath = "/proxy.pac";

  server.forGet(pacFilePath).thenReply(200, pacFileContents, {
    "content-type": "application/x-ns-proxy-autoconfig",
  });
  // TODO: Um, this is MacOS specific, and only `Wi-Fi` LOL.
  execSync(
    `networksetup -setautoproxyurl "Wi-Fi" "https://localhost:${proxyPort}${pacFilePath}"`
  );
}
