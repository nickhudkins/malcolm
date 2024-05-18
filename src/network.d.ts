declare module "network" {
  interface NetworkInterface {
    desc: string;
  }
  export const get_active_interface: (
    cb: (err: Error, NetworkInterface) => void
  ) => void;
}
