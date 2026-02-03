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
});

export type Victim = z.infer<typeof VictimSchema>;

export const VictimsResponseSchema = z.array(VictimSchema);
export type VictimsResponse = z.infer<typeof VictimsResponseSchema>;

export async function fetchVictims(): Promise<VictimsResponse> {
  const data = await getJson<unknown>("/api/victims/");
  return VictimsResponseSchema.parse(data);
}