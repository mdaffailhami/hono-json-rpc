import type {
  JsonRpcError,
  JsonRpcRequest,
  JsonRpcResponse,
  JsonRpcMethods,
  JsonRpcId,
} from "./types";
import { JSON_RPC_ERRORS } from "./constants";
import { flattenError } from "zod";

/** Build a JSON-RPC 2.0 error response. */
export function makeError(id: JsonRpcId, error: JsonRpcError): JsonRpcResponse {
  return { jsonrpc: "2.0", error, id };
}

/** Build a JSON-RPC 2.0 success response. */
export function makeResult(id: JsonRpcId, result: unknown): JsonRpcResponse {
  return { jsonrpc: "2.0", result, id };
}

/**
 * Execute a single JSON-RPC 2.0 request.
 * Looks up the method handler, calls it, and returns the response.
 * Returns null for notifications (requests without an id).
 */
export function handleRequest(
  req: JsonRpcRequest,
  methods: JsonRpcMethods,
): JsonRpcResponse | null {
  const handler = methods[req.method];
  if (!handler)
    return makeError(req.id ?? null, JSON_RPC_ERRORS.METHOD_NOT_FOUND);

  try {
    const result = handler(req.params);
    // Notifications don't receive a response
    if (req.id === undefined) return null;
    return makeResult(req.id, result);
  } catch (err: any) {
    // Notifications don't receive error responses either
    if (req.id === undefined) return null;

    // Handle Zod validation errors from `z.function().implement()` to INVALID_PARAMS
    if (err?.name === "ZodError" || err?.name === "$ZodError") {
      // Strip argument index from paths (z.function() input is [schema], so paths start with 0)
      const issues = err.issues.map((issue: any) => ({
        ...issue,
        path: issue.path.slice(1),
      }));
      const { formErrors, fieldErrors } = flattenError({ ...err, issues });
      return makeError(req.id, {
        ...JSON_RPC_ERRORS.INVALID_PARAMS,
        data: { root: formErrors, fields: fieldErrors },
      });
    }

    return makeError(req.id, JSON_RPC_ERRORS.INTERNAL_ERROR);
  }
}
