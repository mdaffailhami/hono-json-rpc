import { JsonRpcRequest, JsonRpcResponse, JsonRpcMethods } from "./types";
import { JSON_RPC_ERRORS } from "./constants";
import { makeError, handleRequest } from "./helpers";

/**
 * Create a JSON-RPC 2.0 app bound to the given methods.
 * Returns an object with a `.handle()` method that accepts raw JSON
 * and returns response(s).
 */
function createJsonRpcApp(methods: JsonRpcMethods) {
  return {
    handle(raw: string): JsonRpcResponse | JsonRpcResponse[] | null {
      // Parse raw JSON — invalid syntax returns a parse error
      let body: any;
      try {
        body = JSON.parse(raw);
      } catch {
        return makeError(null, JSON_RPC_ERRORS.PARSE_ERROR);
      }

      // Batch request: array of individual requests
      if (Array.isArray(body)) {
        if (body.length === 0)
          return makeError(null, JSON_RPC_ERRORS.INVALID_REQUEST);

        const responses: JsonRpcResponse[] = [];
        for (const item of body) {
          // Validate request structure via Zod
          const parsed = JsonRpcRequest.safeParse(item);
          if (!parsed.success) {
            responses.push(
              makeError(item?.id ?? null, JSON_RPC_ERRORS.INVALID_REQUEST),
            );
            continue;
          }
          // Execute method — handleRequest catches method errors internally
          const res = handleRequest(parsed.data, methods);
          if (res) responses.push(res);
        }
        if (responses.length === 0) return null;
        return responses;
      }

      // Single request: validate then execute
      const parsed = JsonRpcRequest.safeParse(body);
      if (!parsed.success)
        return makeError(body?.id ?? null, JSON_RPC_ERRORS.INVALID_REQUEST);
      return handleRequest(parsed.data, methods);
    },
  };
}

export type { JsonRpcRequest, JsonRpcResponse, JsonRpcMethods } from "./types";
export { JSON_RPC_ERRORS } from "./constants";
export { createJsonRpcApp };
