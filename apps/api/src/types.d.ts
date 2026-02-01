import "@fastify/cookie";
import "@fastify/jwt";
import "fastify";
import type { Server as SocketIOServer } from "socket.io";

declare module "fastify" {
  interface FastifyRequest {
    cookies: Record<string, string | undefined>;
  }

  interface FastifyReply {
    setCookie: (name: string, value: string, options?: unknown) => this;
    clearCookie: (name: string, options?: unknown) => this;
  }

  interface FastifyInstance {
    io: SocketIOServer;
    jwt: {
      sign: (payload: unknown, options?: unknown) => string;
      verify: (token: string, options?: unknown) => unknown;
    };
  }
}