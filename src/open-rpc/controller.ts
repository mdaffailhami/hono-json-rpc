import { z } from "zod";
import { createJsonRpcMethod, JsonRpcMethod } from "#src/json-rpc";
import { OpenrpcDocument } from "@open-rpc/spec-types/1_4";
import { mathController } from "#src/math";
import { createOpenRpcMethod } from "./helpers";

export const openRpcController = {
    "rpc.discover": createJsonRpcMethod({
    summary: "Gets OpenRPC specification",
    output: z.record(z.string(), z.any()),
    body: () => {
      const openRpcSpec: OpenrpcDocument = {
        openrpc: "1.3.2",
        info: {
          title: "Hono JSON-RPC",
          version: "1.0.0",
        },
        servers: [{ name: "Hono JSON-RPC", url: "http://localhost:3000/" }],
        methods: Object.entries(methods).map(([name, method]) =>
          createOpenRpcMethod(name, method),
        ),
      };
      return openRpcSpec;
    },
  }),
};

/** OpenRPC registry */
const methods: Record<string, JsonRpcMethod<any, any>> = {
  ...openRpcController,
  ...mathController,
};
