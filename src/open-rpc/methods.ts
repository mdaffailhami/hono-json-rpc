import { openRpcSpec } from "./registry";
import { RpcDiscoverMethod } from "./types";

export const openRpcMethods = {
  "rpc.discover": RpcDiscoverMethod.implement(() => {
    return openRpcSpec;
  }),
};
