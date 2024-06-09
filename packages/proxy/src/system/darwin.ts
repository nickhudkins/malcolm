import { execSync } from "child_process";

import { PAC_FILE_PATH } from "../constants.js";
import type { MalcolmSystemConfig, MalcolmSystemFunctions } from "./system.js";

function buildRemoveCertificateCommand(certName: string): string {
  return `sudo security delete-certificate -c "${certName}"`;
}

function buildTrustCertificateCommand(certName: string): string {
  return `sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ${certName}`;
}

function buildSetProxyCommand(networkInterfaceName: string, proxyPort: MalcolmSystemConfig["proxyPort"]): string {
  return `networksetup -setautoproxyurl "${networkInterfaceName}" "https://localhost:${proxyPort}${PAC_FILE_PATH}"`;
}

function buildUnsetProxyCommand(networkInterfaceName: string): string {
  return `networksetup -setautoproxyurl "${networkInterfaceName}" "off"`;
}

function getNetworkInterfaceName(networkName: string): string {
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

  if (cleanedName === undefined) {
    throw new Error("Unable to getNetworkInterfaceName!");
  }

  return cleanedName;
}

export default {
  buildRemoveCertificateCommand,
  buildTrustCertificateCommand,
  buildSetProxyCommand,
  buildUnsetProxyCommand,
  getNetworkInterfaceName,
} as MalcolmSystemFunctions;
