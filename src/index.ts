import { Hono } from "hono";
import { createJsonRpcApp } from "./json-rpc";
import { openRpcApp, openRpcMethods } from "./open-rpc";
import { mathMethods } from "./math";

const jsonRpcApp = createJsonRpcApp({
  ...openRpcMethods,
  ...mathMethods,
});

const app = new Hono();

/** JSON-RPC 2.0 endpoint */
app.post("/", async (c) => {
  const raw = await c.req.text();
  const result = jsonRpcApp.handle(raw);

  if (result === null) return c.body(null, 204);
  return c.json(result, 200);
});

/** OpenRPC Playground/Docs */
app.route("/", openRpcApp);

export default app;
