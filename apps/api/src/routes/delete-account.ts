import type { FastifyPluginAsync } from "fastify";
import argon2 from "argon2";
import { z } from "zod";

import { prisma } from "../prisma";

const bodySchema = z.object({
  password: z.string().min(1),
});

export const deleteAccountRoutes: FastifyPluginAsync = async (app) => {
  app.post("/api/delete-account", async (req, reply) => {
    const sid = req.cookies.webrat_session;
    if (!sid) {
      return reply.code(401).send({ error: "unauthorized" });
    }

    const session = await prisma.session.findUnique({
      where: { id: sid },
      include: { user: { select: { id: true, passwordHash: true } } },
    });

    if (!session) {
      return reply.code(401).send({ error: "unauthorized" });
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      await prisma.session.delete({ where: { id: sid } }).catch(() => undefined);
      return reply.code(401).send({ error: "unauthorized" });
    }

    const body = bodySchema.parse(req.body);
    const pwd = String(body.password || "");

    const ok = await argon2.verify(session.user.passwordHash, pwd).catch(() => false);
    if (!ok) {
      return reply.code(401).send({ error: "invalid_password" });
    }

    await prisma.buildJob.deleteMany({ where: { userId: session.user.id } });
    await prisma.user.delete({ where: { id: session.user.id } });

    const secure = process.env.NODE_ENV === "production";

    reply.clearCookie("webrat_session", {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure,
    });

    reply.clearCookie("webrat_csrf", {
      path: "/",
      sameSite: "strict",
      secure,
    });

    reply.clearCookie("webrat_captcha", {
      path: "/",
      sameSite: "strict",
      secure,
    });

    return reply.code(200).send({ ok: true });
  });
};
