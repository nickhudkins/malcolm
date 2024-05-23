declare module "network" {
  interface NetworkInterface {
    desc: string;
  }
  // eslint-disable-next-line no-unused-vars
  export const get_active_interface: (cb: (err: Error, interface: NetworkInterface) => void) => void;
}
