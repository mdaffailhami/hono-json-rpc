import app from "../src/index";

const BASE = "http://localhost:3000";

async function req(method: string, params?: unknown, id?: unknown) {
  const res = await app.request(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method,
      ...(params !== undefined && { params }),
      ...(id !== undefined && { id }),
    }),
  });
  if (res.status === 204) return null;
  return res.json();
}

async function reqRaw(raw: unknown) {
  const res = await app.request(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof raw === "string" ? raw : JSON.stringify(raw),
  });
  if (res.status === 204) return null;
  return res.json();
}

let passed = 0;
let failed = 0;

function assert(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.log(`  ✗ ${label}`);
    console.log(`    expected: ${JSON.stringify(expected)}`);
    console.log(`    actual:   ${JSON.stringify(actual)}`);
    failed++;
  }
}

// ─── VALID REQUESTS ─────────────────────────────────────────────────────────

console.log("\n== Valid Requests ==");

assert("math.add 2+3=5", await req("math.add", { a: 2, b: 3 }, 1), {
  jsonrpc: "2.0",
  result: 5,
  id: 1,
});

assert("math.add -5+10=5", await req("math.add", { a: -5, b: 10 }, 2), {
  jsonrpc: "2.0",
  result: 5,
  id: 2,
});

assert("math.add 0+0=0", await req("math.add", { a: 0, b: 0 }, 3), {
  jsonrpc: "2.0",
  result: 0,
  id: 3,
});

assert("math.divide 10/2=5", await req("math.divide", { a: 10, b: 2 }, 4), {
  jsonrpc: "2.0",
  result: 5,
  id: 4,
});

assert("math.divide -21/7=-3", await req("math.divide", { a: -21, b: 7 }, 5), {
  jsonrpc: "2.0",
  result: -3,
  id: 5,
});

assert("math.divide 0/999=0", await req("math.divide", { a: 0, b: 999 }, 6), {
  jsonrpc: "2.0",
  result: 0,
  id: 6,
});

assert("math.swap [1,2] -> [2,1]", await req("math.swap", [1, 2], 7), {
  jsonrpc: "2.0",
  result: [2, 1],
  id: 7,
});

assert("math.swap [-5,100] -> [100,-5]", await req("math.swap", [-5, 100], 8), {
  jsonrpc: "2.0",
  result: [100, -5],
  id: 8,
});

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────

console.log("\n== Notifications ==");

assert(
  "notification returns null",
  await req("math.add", { a: 1, b: 1 }),
  null,
);

// ─── INVALID PARAMS ──────────────────────────────────────────────────────────

console.log("\n== Invalid Params ==");

assert("wrong type", await req("math.add", { a: "not a number", b: 3 }, 10), {
  jsonrpc: "2.0",
  error: {
    code: -32602,
    message: "Invalid params",
    data: {
      root: [],
      fields: { a: ["Invalid input: expected number, received string"] },
    },
  },
  id: 10,
});

assert("missing field", await req("math.add", { a: 1 }, 11), {
  jsonrpc: "2.0",
  error: {
    code: -32602,
    message: "Invalid params",
    data: {
      root: [],
      fields: { b: ["Invalid input: expected number, received undefined"] },
    },
  },
  id: 11,
});

assert(
  "extra params ignored",
  await req("math.add", { a: 1, b: 2, c: 3 }, 12),
  {
    jsonrpc: "2.0",
    result: 3,
    id: 12,
  },
);

assert("division by zero", await req("math.divide", { a: 10, b: 0 }, 13), {
  jsonrpc: "2.0",
  error: {
    code: -32602,
    message: "Invalid params",
    data: { root: [], fields: { b: ["Invalid input: cannot divide by zero"] } },
  },
  id: 13,
});

assert("swap wrong type in array", await req("math.swap", [1, "bad"], 14), {
  jsonrpc: "2.0",
  error: {
    code: -32602,
    message: "Invalid params",
    data: {
      root: [],
      fields: { "1": ["Invalid input: expected number, received string"] },
    },
  },
  id: 14,
});

assert("swap too few elements", await req("math.swap", [1], 15), {
  jsonrpc: "2.0",
  error: {
    code: -32602,
    message: "Invalid params",
    data: { root: ["Too small: expected array to have >=2 items"], fields: {} },
  },
  id: 15,
});

assert("params as string", await req("math.add", "bad", 20), {
  jsonrpc: "2.0",
  error: { code: -32600, message: "Invalid Request" },
  id: 20,
});

assert("params as array", await req("math.add", [1, 2], 21), {
  jsonrpc: "2.0",
  error: {
    code: -32602,
    message: "Invalid params",
    data: {
      root: ["Invalid input: expected object, received array"],
      fields: {},
    },
  },
  id: 21,
});

assert("empty object", await req("math.add", {}, 22), {
  jsonrpc: "2.0",
  error: {
    code: -32602,
    message: "Invalid params",
    data: {
      root: [],
      fields: {
        a: ["Invalid input: expected number, received undefined"],
        b: ["Invalid input: expected number, received undefined"],
      },
    },
  },
  id: 22,
});

// ─── METHOD NOT FOUND ────────────────────────────────────────────────────────

console.log("\n== Method Not Found ==");

assert("unknown method", await req("math.subtract", { a: 1, b: 1 }, 20), {
  jsonrpc: "2.0",
  error: { code: -32601, message: "Method not found" },
  id: 20,
});

// ─── INVALID REQUEST STRUCTURE ───────────────────────────────────────────────

console.log("\n== Invalid Request Structure ==");

assert(
  "no method",
  await reqRaw({ jsonrpc: "2.0", params: { a: 1 }, id: 30 }),
  {
    jsonrpc: "2.0",
    error: { code: -32600, message: "Invalid Request" },
    id: 30,
  },
);

assert(
  "wrong version",
  await reqRaw({
    jsonrpc: "1.0",
    method: "math.add",
    params: { a: 1, b: 2 },
    id: 31,
  }),
  {
    jsonrpc: "2.0",
    error: { code: -32600, message: "Invalid Request" },
    id: 31,
  },
);

assert("empty body", await reqRaw(""), {
  jsonrpc: "2.0",
  error: { code: -32700, message: "Parse error" },
  id: null,
});

assert("invalid json", await reqRaw("{broken json"), {
  jsonrpc: "2.0",
  error: { code: -32700, message: "Parse error" },
  id: null,
});

assert("empty batch", await reqRaw([]), {
  jsonrpc: "2.0",
  error: { code: -32600, message: "Invalid Request" },
  id: null,
});

assert("null body", await reqRaw(null), {
  jsonrpc: "2.0",
  error: { code: -32600, message: "Invalid Request" },
  id: null,
});

// ─── BATCH REQUESTS ──────────────────────────────────────────────────────────

console.log("\n== Batch Requests ==");

assert(
  "valid batch",
  await reqRaw([
    { jsonrpc: "2.0", method: "math.add", params: { a: 1, b: 2 }, id: 40 },
    { jsonrpc: "2.0", method: "math.divide", params: { a: 12, b: 3 }, id: 41 },
    { jsonrpc: "2.0", method: "math.swap", params: [10, 20], id: 42 },
  ]),
  [
    { jsonrpc: "2.0", result: 3, id: 40 },
    { jsonrpc: "2.0", result: 4, id: 41 },
    { jsonrpc: "2.0", result: [20, 10], id: 42 },
  ],
);

assert(
  "batch with error",
  await reqRaw([
    { jsonrpc: "2.0", method: "math.add", params: { a: 1, b: 2 }, id: 43 },
    { jsonrpc: "2.0", method: "math.subtract", params: { a: 1, b: 1 }, id: 44 },
  ]),
  [
    { jsonrpc: "2.0", result: 3, id: 43 },
    {
      jsonrpc: "2.0",
      error: { code: -32601, message: "Method not found" },
      id: 44,
    },
  ],
);

assert(
  "batch with invalid request",
  await reqRaw([
    { jsonrpc: "2.0", method: "math.add", params: { a: 1, b: 2 }, id: 45 },
    { jsonrpc: "2.0" },
  ]),
  [
    { jsonrpc: "2.0", result: 3, id: 45 },
    {
      jsonrpc: "2.0",
      error: { code: -32600, message: "Invalid Request" },
      id: null,
    },
  ],
);

// ─── GET / ───────────────────────────────────────────────────────────────────

console.log("\n== GET / ==");

{
  const res = await app.request(BASE);
  const body = await res.json();
  assert("GET / returns status", body, {
    status: "ok",
    message: "JSON-RPC 2.0 endpoint — use POST /",
  });
}

// ─── SUMMARY ─────────────────────────────────────────────────────────────────

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
