import { Hono } from "hono";
import { JSONRPCServer } from "json-rpc-2.0";
import { openRpcApp, openRpcController } from "./open-rpc";
import { mathController } from "./math";

const jsonRpcApp = new JSONRPCServer();

// JSON-RPC method registration
for (const [name, handler] of Object.entries({
  ...openRpcController,
  ...mathController,
})) {
  jsonRpcApp.addMethod(name, handler);
}

const app = new Hono();

/** OpenRPC Playground/Docs */
app.route("/", openRpcApp);

/** JSON-RPC 2.0 endpoint */
app.all("/", async (c) => {
  // Reject with `405 Method Not Allowed` for any method that isn't allowed
  if (c.req.method !== "POST" && c.req.method !== "QUERY") {
    return c.body(null, 405, {
      allow: "HEAD, GET, QUERY, POST",
    });
  }

  const raw = await c.req.text();
  const response = await jsonRpcApp.receiveJSON(raw);

  if (response === null) return c.body(null, 204);

  // Use `Cache-Control` header for QUERY request to let the browser caches the response
  // Do not use it for `204 No Content` response
  if (c.req.method === "QUERY") {
    c.header("cache-control", "public, max-age=3600");
  }

  return c.json(response, 200);
});

export default app;
