function asNumbers(params: unknown): [number, number] {
  if (!Array.isArray(params) || params.length < 2)
    throw { code: -32602, message: "Invalid params: expected [a, b]" };
  const [a, b] = params;
  if (typeof a !== "number" || typeof b !== "number")
    throw { code: -32602, message: "Invalid params: both must be numbers" };
  return [a, b];
}

export const mathMethods = {
  "math.add"(params: Record<string, unknown> | unknown[]) {
    const [a, b] = asNumbers(params);
    return a + b;
  },
  "math.multiply"(params: Record<string, unknown> | unknown[]) {
    const [a, b] = asNumbers(params);
    return a * b;
  },
};
