import "dotenv/config";

import { buildApp } from "./app";
import { getEnv } from "./config";

const env = getEnv();
const app = await buildApp();

await app.listen({ port: env.PORT, host: env.HOST });