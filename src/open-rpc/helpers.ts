import {
  ContentDescriptorObject,
  MethodObject,
} from "@open-rpc/spec-types/1_4";
import { z } from "zod";

export function createOpenRpcMethods(
  methods: z.ZodFunction<any, any>[],
): MethodObject[] {
  return methods.map((method) => createOpenRpcMethod(method));
}

function createOpenRpcMethod(method: z.ZodFunction<any, any>): MethodObject {
  // Extract inputs and output from the Zod Function metadata
  const input = method._zod.def.input.def.items[0]; // Gets the first element in the input array
  const output = method._zod.def.output;

  let paramStructure: "by-name" | "by-position" | undefined = undefined;
  const params: ContentDescriptorObject[] = [];

  // Generate Native JSON Schema for Result, stripping out the root $schema tag
  const { $schema: _, ...cleanOutput } = z.toJSONSchema(output);
  const result: ContentDescriptorObject = {
    name: method.meta()?.title || "",
    schema: cleanOutput as any,
  };

  // Case A: The API accepts an object payload (by-name)
  if (input instanceof z.ZodObject) {
    paramStructure = "by-name";
    const shape = input.shape;

    for (const key of Object.keys(shape)) {
      const field = shape[key];

      // Convert field natively and strip out $schema noise
      const { $schema: __, ...cleanField } = z.toJSONSchema(field);
      const isRequired = !field.safeParse(undefined).success;

      params.push({
        name: key,
        required: isRequired,
        summary: field.meta()?.description || "",
        schema: cleanField as any,
      });
    }
  }
  // Case B: The API accepts a sequential array/tuple payload (by-position)
  else if (input instanceof z.ZodTuple) {
    paramStructure = "by-position";
    const items = input.def.items as z.ZodTypeAny[];

    items.forEach((field, i) => {
      const { $schema: __, ...cleanField } = z.toJSONSchema(field);
      const isRequired = !field.safeParse(undefined).success;

      params.push({
        name: `${i}`,
        required: isRequired,
        summary: field.meta()?.description || "",
        schema: cleanField as any,
      });
    });
  }

  return {
    name: method.meta()?.title || "",
    summary: method.meta()?.description || "",
    paramStructure,
    params,
    result,
  };
}
