import {
  ContentDescriptorObject,
  MethodObject,
} from "@open-rpc/spec-types/1_4";
import { z } from "zod";
import type { JsonRpcMethod } from "#src/json-rpc";

/** Generate an OpenRPC method object from a createJsonRpcMethod definition. */
export function createOpenRpcMethod(
  name: string,
  { input, output, summary }: JsonRpcMethod<any, any>,
): MethodObject {
  let paramStructure: "by-name" | "by-position" | undefined;
  const params: ContentDescriptorObject[] = [];

  const { $schema: _, ...cleanOutput } = z.toJSONSchema(output);
  const result: ContentDescriptorObject = {
    name,
    schema: cleanOutput as any,
  };

  if (input instanceof z.ZodObject) {
    paramStructure = "by-name";
    const shape = input.shape;

    for (const key of Object.keys(shape)) {
      const field = shape[key];
      const { $schema: __, ...cleanField } = z.toJSONSchema(field);
      const isRequired = !field.safeParse(undefined).success;

      params.push({
        name: key,
        required: isRequired,
        summary: field.meta()?.description || "",
        schema: cleanField as any,
      });
    }
  } else if (input instanceof z.ZodTuple) {
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
    name,
    summary,
    paramStructure,
    params,
    result,
  };
}
