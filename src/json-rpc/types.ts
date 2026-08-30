import { z } from "zod";

export type JsonRpcMethod<
  TInput extends Record<string, unknown> | unknown[] = Record<string, unknown>,
  TOutput = unknown,
> = {
  (params: TInput): TOutput;
  input?: z.ZodType<TInput>;
  output: z.ZodType<TOutput>;
  summary: string;
};
