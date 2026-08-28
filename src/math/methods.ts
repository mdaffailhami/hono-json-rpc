import { AddMethod, DivideMethod, SwapMethod } from "./types";

export const mathMethods = {
  "math.add": AddMethod.implement(({ a, b }) => {
    return a + b;
  }),
  "math.divide": DivideMethod.implement(({ a, b }) => {
    return a / b;
  }),
  "math.swap": SwapMethod.implement(([a, b]) => {
    return [b, a];
  }),
};
