import { mkdirSync, writeFileSync, readFileSync, existsSync } from "fs";
import { execSync } from "child_process";
import {
  Mockttp,
  generateCACertificate,
  generateSPKIFingerprint,
} from "mockttp";

import {
  DEFAULT_CERT_PATH,
  DEFAULT_CONFIG_DIR,
  DEFAULT_KEY_PATH,
} from "./constants.js";

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

export async function ensureCACertificate(): Promise<
  MalcolmSystemConfig["https"]
> {
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

  // Trust the cert (on Mac OS)
  execSync(
    `sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ${DEFAULT_CERT_PATH}`
  );
  return { key, cert };
}

export async function prepareSystem({
  shouldProxy,
  server,
  proxyPort,
  https,
}: MalcolmSystemConfig) {
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
