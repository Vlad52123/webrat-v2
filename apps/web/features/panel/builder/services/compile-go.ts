import { compileGoFromConfig } from "./compile-go-config";

export type { CompileGoConfigRequest as CompileGoRequest, CompileGoEnqueueResponse, CompileGoStatusResponse } from "./compile-go-config";

export async function compileGo(req: import("./compile-go-config").CompileGoConfigRequest): Promise<{ blob: Blob; filename: string }> {
   return compileGoFromConfig(req);
}