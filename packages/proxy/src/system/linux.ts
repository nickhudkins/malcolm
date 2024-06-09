// import { execSync } from "child_process";

import type { MalcolmSystemFunctions } from "./system.js";

// TODO: Impelemnt, maybe fix types too!
export default {
  buildRemoveCertificateCommand(_certName) {
    return "sudo update-ca-certificates --fresh";
  },
  buildSetProxyCommand(_networkInterfaceName, _proxyPort) {
    // TODO: Figure out what needs to be done here
    return "echo Hello";
  },
  buildTrustCertificateCommand(_certName) {
    return "sudo update-ca-certificates";
  },
  buildUnsetProxyCommand(_networkInterfaceName) {
    // TODO: Figure out what needs to be done here
    return "echo Hello";
  },
  getNetworkInterfaceName(interfaceName) {
    // TODO: Figure out what needs to be done here
    // const allNetworkIntefaces = execSync(`ip link show`).toString().split(/^n/im);

    // let cleanedName;
    // allNetworkIntefaces.filter(networkInterface => {
    //   const foundInteface = networkInterface.includes(interfaceName);

    //   if (foundInteface) {
    //     const [_index, dirtyName] = networkInterface.split(" ");
    //   }
    // });
    return interfaceName;
  },
} as MalcolmSystemFunctions;
