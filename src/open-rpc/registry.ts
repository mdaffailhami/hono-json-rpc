import { OpenrpcDocument } from "@open-rpc/spec-types/1_4";
import { openRpcOpenRpc } from "./open-rpc";
import { mathOpenRpc } from "#src/math";

export const openRpcSpec: OpenrpcDocument = {
  openrpc: "1.3.2",
  info: {
    title: "Hono JSON-RPC",
    version: "1.0.0",
  },
  servers: [{ name: "Hono JSON-RPC", url: "http://localhost:3000/" }],
  methods: [...openRpcOpenRpc, ...mathOpenRpc],
};
