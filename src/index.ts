import { Hono } from "hono";
import { createJsonRpcApp } from "./json-rpc";
import { mathMethods } from "./math";

const jsonRpcApp = createJsonRpcApp({
  ...mathMethods,
});

const app = new Hono();

app.post("/", async (c) => {
  const raw = await c.req.text();
  const result = jsonRpcApp.handle(raw);

  if (result === null) return c.body(null, 204);
  return c.json(result, 200);
});

app.get("/", (c) => {
  return c.json({
    status: "ok",
    message: "JSON-RPC 2.0 endpoint — use POST /",
  });
});

export default app;
