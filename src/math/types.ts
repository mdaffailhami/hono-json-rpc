import { z } from "zod";

export const AddMethod = z.function({
  input: [
    z.object({
      a: z.number(),
      b: z.number(),
    }),
  ],
  output: z.number(),
});
export type AddMethod = z.infer<typeof AddMethod>;

export const DivideMethod = z.function({
  input: [
    z.object({
      a: z.number(),
      b: z
        .number()
        .refine((v) => v !== 0, "Invalid input: cannot divide by zero"),
    }),
  ],
  output: z.number(),
});
export type DivideMethod = z.infer<typeof DivideMethod>;

export const SwapMethod = z.function({
  input: [z.tuple([z.number(), z.number()])],
  output: z.tuple([z.number(), z.number()]),
});
export type SwapMethod = z.infer<typeof SwapMethod>;
