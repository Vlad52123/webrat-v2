import type { FastifyPluginAsync } from "fastify";
import argon2 from "argon2";
import { z } from "zod";
import { prisma } from "../prisma";

const registerBodySchema = z.object({
  login: z.string().regex(/^[A-Za-z0-9_-]{5,12}$/),
  password: z.string().regex(/^[A-Za-z0-9_-]{6,24}$/),
});

const loginBodySchema = z.object({
  login: z.string().regex(/^[A-Za-z0-9_-]{5,12}$/),
  password: z.string().regex(/^[A-Za-z0-9_-]{6,24}$/),
});

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post("/auth/register", async (req, reply) => {
    const body = registerBodySchema.parse(req.body);
    const login = body.login.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { login } });
    if (existing) {
      return reply.code(409).send({ error: "email_taken" });
    }

    const passwordHash = await argon2.hash(body.password);

    const user = await prisma.user.create({
      data: {
        login,
        passwordHash,
      },
      select: { id: true, login: true, createdAt: true },
    });

    const token = app.jwt.sign({ sub: user.id });

    return reply.send({ user, token });
  });

  app.post("/auth/login", async (req, reply) => {
    const body = loginBodySchema.parse(req.body);
    const login = body.login.toLowerCase();

    const user = await prisma.user.findUnique({ where: { login } });
    if (!user) {
      return reply.code(401).send({ error: "invalid_credentials" });
    }

    const ok = await argon2.verify(user.passwordHash, body.password);
    if (!ok) {
      return reply.code(401).send({ error: "invalid_credentials" });
    }

    const token = app.jwt.sign({ sub: user.id });

    return reply.send({
      user: { id: user.id, login: user.login, createdAt: user.createdAt },
      token,
    });
  });
};
