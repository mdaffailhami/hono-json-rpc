import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { readFileSync } from "fs";
import { basename, resolve } from "path";
import { globSync } from "glob";

/** Playground UI schema configuration — locked server-side, not exposed in URL. */
const playgroundQuery = new URLSearchParams({
  "uiSchema[appBar][ui:splitView]": "false",
  "uiSchema[appBar][ui:edit]": "false",
  "uiSchema[appBar][ui:input]": "false",
  "uiSchema[appBar][ui:examplesDropdown]": "false",
  "uiSchema[appBar][ui:transports]": "false",
  "uiSchema[appBar][ui:title]": "Hono JSON-RPC",
  "uiSchema[appBar][ui:logoUrl]":
    "https://avatars.githubusercontent.com/u/74972129",
  schemaUrl: "/",
}).toString();

const playgroundDist = "node_modules/@open-rpc/playground/dist";

// Dynamically find the main JS bundle (hash changes on package updates)
const [jsPath] = globSync(`${playgroundDist}/assets/index-*.js`);
const jsName = basename(jsPath);

// Patch JS: replace `window.location.search` with global variable
// so the playground reads config without URL params
const patchedJs = readFileSync(jsPath, "utf-8").replace(
  "window.location.search",
  "window.__PLAYGROUND_SEARCH__",
);

// Patch HTML: inject config as global variable before the bundle loads
const playgroundHtml = readFileSync(
  resolve(`${playgroundDist}/index.html`),
  "utf-8",
)
  .replace(
    "</head>",
    `<script>window.__PLAYGROUND_SEARCH__="${playgroundQuery}";</script>\n</head>`,
  )
  .replace("OpenRPC Playground", "Hono JSON-RPC");

export const openRpcApp = new Hono();

// Serve patched HTML at root
openRpcApp.get("/", (c) => c.html(playgroundHtml));

// Serve patched JS (intercept before serveStatic catches it)
openRpcApp.get(`/assets/${jsName}`, (c) => {
  return c.body(patchedJs, 200, { "Content-Type": "application/javascript" });
});

// Serve all other static assets (CSS, fonts, icons, etc.) from node_modules
openRpcApp.use("/*", serveStatic({ root: `./${playgroundDist}` }));
