import { z } from "zod";

export const loginSchema = z.object({
   login: z.string().regex(/^[A-Za-z0-9_-]{5,12}$/),
   password: z.string().regex(/^[A-Za-z0-9_-]{6,24}$/),
});

export type LoginValues = z.infer<typeof loginSchema>;