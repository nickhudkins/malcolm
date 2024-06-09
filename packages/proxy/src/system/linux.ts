import type { MalcolmSystemFunctions } from "./system.js";

// TODO: Impelemnt, maybe fix types too!
export default {
  buildRemoveCertificateCommand(_certName) {},
  buildSetProxyCommand(_networkInterfaceName, _proxyPort) {},
  buildTrustCertificateCommand(_certName) {},
  buildUnsetProxyCommand(_networkInterfaceName) {},
  getNetworkInterfaceName(_interfaceName) {},
} as MalcolmSystemFunctions;
