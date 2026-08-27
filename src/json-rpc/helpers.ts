import type { JsonRpcRequest, JsonRpcResponse } from "./types";
import { JSON_RPC_ERRORS } from "./constants";

type MethodHandler = (params: Record<string, unknown> | unknown[]) => unknown;

/** Build a JSON-RPC error response. */
export function makeError(
  id: string | number | null,
  error: { code: number; message: string; data?: unknown },
): JsonRpcResponse {
  return { jsonrpc: "2.0", error, id };
}

/** Build a JSON-RPC success response. */
export function makeResult(
  id: string | number | null,
  result: unknown,
): JsonRpcResponse {
  return { jsonrpc: "2.0", result, id };
}

/** Parse and validate a parsed body as a JSON-RPC 2.0 request. Throws if invalid. */
export function parseRequest(body: unknown): JsonRpcRequest {
  if (!body || typeof body !== "object" || Array.isArray(body))
    throw JSON_RPC_ERRORS.INVALID_REQUEST;
  const req = body as Record<string, unknown>;
  if (req.jsonrpc !== "2.0" || typeof req.method !== "string")
    throw JSON_RPC_ERRORS.INVALID_REQUEST;
  return req as unknown as JsonRpcRequest;
}

/** Execute a single JSON-RPC request. Returns `null` for notifications. */
export function handleRequest(
  req: JsonRpcRequest,
  methods: Record<string, MethodHandler>,
): JsonRpcResponse | null {
  const handler = methods[req.method];
  if (!handler)
    return makeError(req.id ?? null, JSON_RPC_ERRORS.METHOD_NOT_FOUND);

  try {
    const result = handler(req.params ?? []);
    if (req.id === undefined) return null;
    return makeResult(req.id, result);
  } catch (err: any) {
    if (req.id === undefined) return null;
    if (err && typeof err.code === "number" && typeof err.message === "string")
      return makeError(req.id, err);

    return makeError(req.id, JSON_RPC_ERRORS.INTERNAL_ERROR);
  }
}
