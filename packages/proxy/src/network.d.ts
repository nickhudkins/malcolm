declare module "network" {
  interface NetworkInterface {
    name: string;
    desc?: string;
    type?: string;
    ip_address: string;
    mac_address: string;
    gateway_ip: string;
    netmask: string;
    status?: string;
  }

  export const get_active_interface: (cb: (err: Error, interface: NetworkInterface) => void) => void;
}
