import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import { Server as SocketIOServer, type ServerOptions as SocketIOServerOptions } from "socket.io";

import { getEnv } from "./config";
import { healthRoutes } from "./routes/health";
import { captchaRoutes } from "./routes/captcha";
import { loginRoutes } from "./routes/login";
import { deleteAccountRoutes } from "./routes/delete-account";
import { victimsRoutes } from "./routes/victims";

export async function buildApp() {
  const env = getEnv();
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  await app.register(fastifyCookie as unknown as Parameters<typeof app.register>[0]);

  await app.register(rateLimit, {
    max: 120,
    timeWindow: "1 minute",
    addHeaders: {
      "retry-after": true,
    },
  });

  await app.register(jwt, {
    secret: env.JWT_SECRET,
  });

  await app.register(swagger, {
    openapi: {
      info: {
        title: "WebCrystal API",
        version: "0.0.1",
      },
    },
  });

  await app.register(swaggerUI, {
    routePrefix: "/docs",
  });

  const io = new SocketIOServer(
    app.server,
    {
      cors: {
        origin: true,
        credentials: true,
      },
    } as unknown as SocketIOServerOptions,
  );

  app.decorate("io", io);

  app.addHook("onClose", async () => {
    io.close();
  });

  await app.register(healthRoutes);
  await app.register(captchaRoutes);
  await app.register(loginRoutes);
  await app.register(deleteAccountRoutes);
  await app.register(victimsRoutes);

  return app;
}