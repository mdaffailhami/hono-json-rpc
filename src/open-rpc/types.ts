import { z } from "zod";

export const RpcDiscoverMethod = z
  .function({
    input: [],
    output: z.record(z.string(), z.any()),
  })
  .meta({ title: "rpc.discover", description: "Gets OpenRPC specification" });
export type RpcDiscoverMethod = z.infer<typeof RpcDiscoverMethod>;
