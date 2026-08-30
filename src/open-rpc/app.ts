import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { readFileSync } from "fs";
import { basename, resolve } from "path";
import { globSync } from "glob";

/** Playground UI schema configuration. */
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
  "window.__PLAYGROUND_CONFIG__",
);

// Patch HTML: inject config as global variable before the bundle loads
const patchedHtml = readFileSync(
  resolve(`${playgroundDist}/index.html`),
  "utf-8",
)
  .replace(
    "</head>",
    // Replace `+` with space
    `<script>window.__PLAYGROUND_CONFIG__="${playgroundQuery.replace(/\+/g, " ")}";</script>\n</head>`,
  )
  .replace("OpenRPC Playground", "Hono JSON-RPC");

export const openRpcApp = new Hono();

// Serve patched HTML
openRpcApp.get("/", (c) => c.html(patchedHtml));

// Serve patched JS
openRpcApp.get(`/assets/${jsName}`, (c) => {
  return c.body(patchedJs, 200, { "Content-Type": "application/javascript" });
});

// Serve all other static assets (CSS, fonts, icons, etc.)
openRpcApp.get("/*", serveStatic({ root: `./${playgroundDist}` }));
