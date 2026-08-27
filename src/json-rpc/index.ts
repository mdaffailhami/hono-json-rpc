import { JsonRpcResponse } from "./types";
import { JSON_RPC_ERRORS } from "./constants";
import { makeError, parseRequest, handleRequest } from "./helpers";

type MethodHandler = (params: Record<string, unknown> | unknown[]) => unknown;

/**
 * Create a JSON-RPC 2.0 handler bound to the given methods.
 * Returns a function that takes a raw body string and returns the response(s).
 */
export function createJsonRpcHandler(methods: Record<string, MethodHandler>) {
  return function handle(
    raw: string,
  ): JsonRpcResponse | JsonRpcResponse[] | null {
    let body: any;
    try {
      body = JSON.parse(raw);
    } catch {
      return makeError(null, JSON_RPC_ERRORS.PARSE_ERROR);
    }

    if (Array.isArray(body)) {
      if (body.length === 0)
        return makeError(null, JSON_RPC_ERRORS.INVALID_REQUEST);

      const responses: JsonRpcResponse[] = [];
      for (const item of body) {
        try {
          const req = parseRequest(item);
          const res = handleRequest(req, methods);
          if (res) responses.push(res);
        } catch (err: any) {
          responses.push(makeError(item?.id ?? null, err));
        }
      }
      if (responses.length === 0) return null;
      return responses;
    }

    try {
      const req = parseRequest(body);
      return handleRequest(req, methods);
    } catch (err: any) {
      return makeError(body?.id ?? null, err);
    }
  };
}

export type { JsonRpcRequest, JsonRpcResponse } from "./types";
export { JSON_RPC_ERRORS } from "./constants";
