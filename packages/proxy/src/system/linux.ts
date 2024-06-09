import type { MalcolmSystemFunctions } from "./system.js";

// TODO: Impelemnt, maybe fix types too!
export default {
  buildRemoveCertificateCommand(certName) {},
  buildSetProxyCommand(networkInterfaceName, proxyPort) {},
  buildTrustCertificateCommand(certName) {},
  buildUnsetProxyCommand(networkInterfaceName) {},
  getNetworkInterfaceName(interfaceName) {},
} as MalcolmSystemFunctions;
