import { createOpenRpcMethods } from "#src/open-rpc";
import { AddMethod, DivideMethod, SwapMethod } from "./types";

export const mathOpenRpc = createOpenRpcMethods([
  AddMethod,
  DivideMethod,
  SwapMethod,
]);
