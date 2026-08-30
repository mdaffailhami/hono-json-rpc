import { z } from "zod";
import { createJsonRpcMethod } from "#src/json-rpc";

export const mathController = {
  "math.add": createJsonRpcMethod({
    summary: "Adds two numbers",
    input: z.object({
      a: z.number().describe("The first number to add"),
      b: z.number().describe("The second number to add"),
    }),
    output: z.number(),
    body: ({ a, b }) => a + b,
  }),
  "math.divide": createJsonRpcMethod({
    summary: "Divides two numbers",
    input: z.object({
      a: z.number().describe("The first number to divide"),
      b: z
        .number()
        .refine((v) => v !== 0, "Invalid input: cannot divide by zero")
        .describe("The second number to divide"),
    }),
    output: z.number(),
    body: ({ a, b }) => a / b,
  }),
  "math.swap": createJsonRpcMethod({
    summary: "Swaps two numbers",
    input: z.tuple([
      z.number().describe("The first number to swap"),
      z.number().describe("The second number to swap"),
    ]),
    output: z.tuple([z.number(), z.number()]),
    body: ([a, b]) => [b, a],
  }),
};
