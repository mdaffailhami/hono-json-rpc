import { z } from "zod";

export const AddMethod = z
  .function({
    input: [
      z.object({
        a: z.number().describe("The first number to add"),
        b: z.number().describe("The second number to add"),
      }),
    ],
    output: z.number(),
  })
  .meta({ title: "math.add", description: "Adds two numbers" });
export type AddMethod = z.infer<typeof AddMethod>;

export const DivideMethod = z
  .function({
    input: [
      z.object({
        a: z.number().describe("The first number to multiply"),
        b: z
          .number()
          .refine((v) => v !== 0, "Invalid input: cannot divide by zero")
          .describe("The second number to multiply"),
      }),
    ],
    output: z.number(),
  })
  .meta({ title: "math.divide", description: "Divides two numbers" });
export type DivideMethod = z.infer<typeof DivideMethod>;

export const SwapMethod = z
  .function({
    input: [
      z.tuple([
        z.number().describe("The first number to swap"),
        z.number().describe("The second number to swap"),
      ]),
    ],
    output: z.tuple([z.number(), z.number()]),
  })
  .meta({ title: "math.swap", description: "Swaps two numbers" });
export type SwapMethod = z.infer<typeof SwapMethod>;
