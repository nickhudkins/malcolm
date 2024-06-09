import type { MalcolmSystemFunctions } from "./system.js";

// https://docs.mitmproxy.org/stable/howto-transparent/

// TODO: Impelemnt, maybe fix types too!
export default {
  buildRemoveCertificateCommand() {
    return "sudo update-ca-certificates --fresh";
  },
  buildSetProxyCommand(_networkInterface, proxyPort) {
    // TODO: Validate this iptable stuff
    return `sudo sysctl -w net.ipv4.ip_forward=1; \
    sudo sysctl -w net.ipv6.conf.all.forwarding=1; \
    sudo sysctl -w net.ipv4.conf.all.send_redirects=0; \
    sudo iptables -t nat -A OUTPUT -p tcp -m owner ! --uid-owner root --dport 80 -j REDIRECT --to-port ${proxyPort}; \
    sudo iptables -t nat -A OUTPUT -p tcp -m owner ! --uid-owner root --dport 443 -j REDIRECT --to-port ${proxyPort}; \
    sudo ip6tables -t nat -A OUTPUT -p tcp -m owner ! --uid-owner root --dport 80 -j REDIRECT --to-port ${proxyPort}; \
    sudo ip6tables -t nat -A OUTPUT -p tcp -m owner ! --uid-owner root --dport 443 -j REDIRECT --to-port ${proxyPort};`;
  },
  buildTrustCertificateCommand() {
    return "sudo update-ca-certificates";
  },
  buildUnsetProxyCommand(_networkInterface) {
    // TODO: Validate iptable stuff and pass in port
    return `sudo sysctl -w net.ipv4.ip_forward=1; \
    sudo sysctl -w net.ipv6.conf.all.forwarding=1; \
    sudo sysctl -w net.ipv4.conf.all.send_redirects=0; \
    sudo iptables -t nat -D OUTPUT -p tcp -m owner ! --uid-owner root --dport 80 -j REDIRECT --to-port 6969; \
    sudo iptables -t nat -D OUTPUT -p tcp -m owner ! --uid-owner root --dport 443 -j REDIRECT --to-port 6969; \
    sudo ip6tables -t nat -D OUTPUT -p tcp -m owner ! --uid-owner root --dport 80 -j REDIRECT --to-port 6969; \
    sudo ip6tables -t nat -D OUTPUT -p tcp -m owner ! --uid-owner root --dport 443 -j REDIRECT --to-port 6969;`;
  },
  getNetworkInterfaceName(interfaceName) {
    // No-op for linux, just pass through provided interface name
    return interfaceName;
  },
} as MalcolmSystemFunctions;
