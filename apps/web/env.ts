import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
   server: {
      SENTRY_DSN: z.string().trim().optional(),
   },
   client: {
      NEXT_PUBLIC_API_URL: z.string().trim().optional(),
      NEXT_PUBLIC_SENTRY_DSN: z.string().trim().optional(),
   },
   runtimeEnv: {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
      SENTRY_DSN: process.env.SENTRY_DSN,
   },
   emptyStringAsUndefined: true,
});