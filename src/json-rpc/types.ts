// JSON-RPC 2.0 type definitions
// Spec: https://www.jsonrpc.org/specification

/** A single JSON-RPC 2.0 request or notification. */
export type JsonRpcRequest = {
  jsonrpc: "2.0";
  method: string;
  params?: Record<string, unknown> | unknown[];
  /** Omitted for notifications (fire-and-forget). */
  id?: string | number | null;
};

/** Successful response containing the method result. */
export type JsonRpcSuccessResponse = {
  jsonrpc: "2.0";
  result: unknown;
  id: string | number | null;
};

/** Error response when the method fails or the request is invalid. */
export type JsonRpcErrorResponse = {
  jsonrpc: "2.0";
  error: {
    code: number;
    message: string;
    data?: unknown;
  };
  id: string | number | null;
};

export type JsonRpcResponse = JsonRpcSuccessResponse | JsonRpcErrorResponse;

export type JsonRpcError = {
  code: number;
  message: string;
  data?: unknown;
};
