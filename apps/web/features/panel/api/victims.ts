import { z } from "zod";

import { getJson } from "../../../lib/api";

export const VictimSchema = z.object({
   id: z.union([z.string(), z.number()]).optional(),
   ip: z.string().optional(),
   hostname: z.string().optional(),
   user: z.string().optional(),
   admin: z.boolean().optional(),
   window: z.string().optional(),
   country: z.string().optional(),
   last_active: z.union([z.number(), z.string()]).optional(),
   os: z.string().optional(),
   cpu: z.string().optional(),
   ram: z.string().optional(),
   gpu: z.string().optional(),
   comment: z.string().optional(),
   deviceType: z.string().optional(),
   device_type: z.string().optional(),
   online: z.boolean().optional(),
   status: z.string().optional(),
   version: z.string().optional(),
   startupDelaySeconds: z.number().optional(),
   autorunMode: z.string().optional(),
   installPath: z.string().optional(),
   hideFilesEnabled: z.boolean().optional(),
}).passthrough();

export type Victim = z.infer<typeof VictimSchema>;

export const VictimsResponseSchema = z.array(VictimSchema);
export type VictimsResponse = z.infer<typeof VictimsResponseSchema>;

export async function fetchVictims(): Promise<VictimsResponse> {
   const data = await getJson<unknown>("/api/victims/");
   try {
      return VictimsResponseSchema.parse(data);
   } catch (err) {
      if (err instanceof z.ZodError) {
         const e = new Error("Invalid server response");
         (e as unknown as { status?: number }).status = 502;
         throw e;
      }
      throw err;
   }
}