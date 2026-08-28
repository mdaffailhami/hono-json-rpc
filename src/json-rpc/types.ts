import { z } from "zod";

/** JSON-RPC 2.0 version — must be `"2.0"`. */
export const JsonRpcVersion = z.literal("2.0");
export type JsonRpcVersion = z.infer<typeof JsonRpcVersion>;

/** Request ID — string, number, or null. Absent for notifications. */
export const JsonRpcId = z.union([z.string(), z.number(), z.null()]);
export type JsonRpcId = z.infer<typeof JsonRpcId>;

/** Params — either a record or an array. */
export const JsonRpcParams = z.union([
  z.record(z.string(), z.unknown()),
  z.array(z.unknown()),
]);
export type JsonRpcParams = z.infer<typeof JsonRpcParams>;

/**
 * JSON-RPC 2.0 request object.
 * Validates: jsonrpc, method, params (object or array), id.
 */
export const JsonRpcRequest = z.object({
  jsonrpc: JsonRpcVersion,
  method: z.string(),
  params: JsonRpcParams.optional(),
  id: JsonRpcId.optional(),
});
export type JsonRpcRequest = z.infer<typeof JsonRpcRequest>;

/** JSON-RPC 2.0 error object with code, message, and optional data. */
export const JsonRpcError = z.object({
  code: z.number(),
  message: z.string(),
  data: z.unknown().optional(),
});
export type JsonRpcError = z.infer<typeof JsonRpcError>;

/** Successful JSON-RPC 2.0 response containing the method result. */
export const JsonRpcSuccessResponse = z.object({
  jsonrpc: JsonRpcVersion,
  result: z.unknown(),
  id: JsonRpcId,
});
export type JsonRpcSuccessResponse = z.infer<typeof JsonRpcSuccessResponse>;

/** Error JSON-RPC 2.0 response containing the error details. */
export const JsonRpcErrorResponse = z.object({
  jsonrpc: JsonRpcVersion,
  error: JsonRpcError,
  id: JsonRpcId,
});
export type JsonRpcErrorResponse = z.infer<typeof JsonRpcErrorResponse>;

/** JSON-RPC 2.0 response — either success or error. */
export const JsonRpcResponse = z.union([
  JsonRpcSuccessResponse,
  JsonRpcErrorResponse,
]);
export type JsonRpcResponse = z.infer<typeof JsonRpcResponse>;

/** Record of method names to their handlers. */
export const JsonRpcMethods = z.record(
  z.string(),
  z.function({
    input: [z.any()],
    output: z.any(),
  }),
);
export type JsonRpcMethods = z.infer<typeof JsonRpcMethods>;
