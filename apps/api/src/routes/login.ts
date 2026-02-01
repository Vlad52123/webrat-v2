import type { FastifyPluginAsync } from "fastify";
import { randomBytes } from "node:crypto";
import argon2 from "argon2";
import { z } from "zod";

import { prisma } from "../prisma";

const loginBodySchema = z.object({
  login: z.string().regex(/^[A-Za-z0-9_-]{5,12}$/),
  password: z.string().regex(/^[A-Za-z0-9_-]{6,24}$/),
  cfToken: z.string().optional(),
});

function getCsrf(req: { cookies: Record<string, unknown>; headers: Record<string, unknown> }): {
  cookie: string | null;
  header: string | null;
} {
  const cookieRaw = req.cookies["webrat_csrf"];
  const headerRaw = req.headers["x-csrf-token"];

  return {
    cookie: typeof cookieRaw === "string" && cookieRaw ? cookieRaw : null,
    header: typeof headerRaw === "string" && headerRaw ? headerRaw : null,
  };
}

function newSessionId(): string {
  return randomBytes(32).toString("hex");
}

export const loginRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    "/login",
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: "15 minutes",
        },
      },
    },
    async (req, reply) => {
      const { cookie: csrfCookie, header: csrfHeader } = getCsrf(req);
      const captcha = typeof req.cookies.webrat_captcha === "string" ? req.cookies.webrat_captcha : null;

      const body = loginBodySchema.parse(req.body);

      let captchaOk = !!captcha;
      const cfToken = typeof body.cfToken === "string" ? body.cfToken.trim() : "";

      if (!captchaOk && cfToken) {
        const secret = String(process.env.TURNSTILE_SECRET || "").trim();
        if (!secret) {
          captchaOk = true;
        } else {
          try {
            const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
              method: "POST",
              headers: { "content-type": "application/x-www-form-urlencoded" },
              body: new URLSearchParams({
                secret,
                response: cfToken,
                remoteip: typeof req.ip === "string" ? req.ip : "",
              }).toString(),
            });

            const data = (await res.json()) as unknown;
            captchaOk =
              typeof data === "object" &&
              data !== null &&
              "success" in data &&
              (data as { success: unknown }).success === true;
          } catch {
            captchaOk = false;
          }
        }
      }

      if (!csrfCookie || !csrfHeader || csrfHeader !== csrfCookie || !captchaOk) {
        return reply.code(403).send({ error: "security_check_failed" });
      }

      const login = body.login.toLowerCase();
      const password = body.password;

      let user = await prisma.user.findUnique({ where: { login } });

      if (!user) {
        const passwordHash = await argon2.hash(password);
        user = await prisma.user.create({
          data: {
            login,
            passwordHash,
          },
        });
      } else {
        const ok = await argon2.verify(user.passwordHash, password);
        if (!ok) {
          return reply.code(401).send({ error: "invalid_credentials" });
        }
      }

      const sessionId = newSessionId();
      const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000);

      await prisma.session.deleteMany({ where: { userId: user.id } });
      await prisma.session.create({
        data: {
          id: sessionId,
          userId: user.id,
          expiresAt,
          ip: typeof req.ip === "string" ? req.ip : null,
          userAgent: req.headers["user-agent"] ?? null,
        },
      });

      const secure = process.env.NODE_ENV === "production";

      reply.setCookie("webrat_session", sessionId, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure,
        maxAge: 12 * 60 * 60,
      });

      return reply.code(200).send({ ok: true });
    },
  );

  app.get("/me", async (req, reply) => {
    const sid = req.cookies.webrat_session;
    if (!sid) {
      return reply.code(401).send({ error: "unauthorized" });
    }

    const session = await prisma.session.findUnique({
      where: { id: sid },
      include: { user: { select: { id: true, login: true } } },
    });

    if (!session) {
      return reply.code(401).send({ error: "unauthorized" });
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      await prisma.session.delete({ where: { id: sid } }).catch(() => undefined);
      return reply.code(401).send({ error: "unauthorized" });
    }

    return reply.send({
      user: session.user,
      expiresAt: session.expiresAt.toISOString(),
    });
  });

  app.post("/logout", async (req, reply) => {
    const sid = req.cookies.webrat_session;
    if (sid) {
      await prisma.session.delete({ where: { id: sid } }).catch(() => undefined);
    }

    const secure = process.env.NODE_ENV === "production";

    reply.clearCookie("webrat_session", {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure,
    });

    return reply.code(200).send({ ok: true });
  });
};