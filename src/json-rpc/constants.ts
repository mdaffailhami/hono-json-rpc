import { JsonRpcError } from "./types";

/** Standard JSON-RPC 2.0 error codes. */
export const JSON_RPC_ERRORS = {
  /** Invalid JSON was received (-32700). */
  PARSE_ERROR: { code: -32700, message: "Parse error" },
  /** The JSON sent is not a valid Request object (-32600). */
  INVALID_REQUEST: { code: -32600, message: "Invalid Request" },
  /** The method does not exist or is not available (-32601). */
  METHOD_NOT_FOUND: { code: -32601, message: "Method not found" },
  /** Invalid method parameter(s) (-32602). */
  INVALID_PARAMS: { code: -32602, message: "Invalid params" },
  /** Internal JSON-RPC error (-32603). */
  INTERNAL_ERROR: { code: -32603, message: "Internal error" },
} as const satisfies Record<string, JsonRpcError>;
