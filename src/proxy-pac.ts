import { execSync } from "child_process";

// TODO: we have to write the function get get all network interfaces names
// TODO: handle windows if we care
export async function setProxyPac() {
  execSync(
    "networksetup -setautoproxyurl Wi-Fi http://localhost:6969/proxy.pac",
  );
}
