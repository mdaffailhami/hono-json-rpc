import { z } from "zod";
import { JSONRPCErrorException } from "json-rpc-2.0";
import { JsonRpcMethod } from "./types";

export function createJsonRpcMethod<
  TInput extends Record<string, unknown> | unknown[],
  TOutput,
>(opts: {
  summary: string;
  input?: z.ZodType<TInput>;
  output: z.ZodType<TOutput>;
  body: (params: TInput) => TOutput;
}): JsonRpcMethod<TInput, TOutput> {
  const method = ((params: any) => {
    // Input validation
    if (opts.input) {
      const parsedInput = opts.input.safeParse(params);
      if (!parsedInput.success) {
        const { formErrors, fieldErrors } = z.flattenError(parsedInput.error);
        throw new JSONRPCErrorException("Invalid params", -32602, {
          root: formErrors,
          fields: fieldErrors,
        });
      }
      params = parsedInput.data;
    }

    const result = opts.body(params);

    // Output validation
    const parsedOutput = opts.output.safeParse(result);
    if (!parsedOutput.success) {
      console.error(
        "Output validation failed:",
        z.flattenError(parsedOutput.error),
      );
      throw new JSONRPCErrorException("Internal error", -32603);
    }

    return result;
  }) as JsonRpcMethod<TInput, TOutput>;

  method.input = opts.input;
  method.output = opts.output;
  method.summary = opts.summary;

  return method;
}
