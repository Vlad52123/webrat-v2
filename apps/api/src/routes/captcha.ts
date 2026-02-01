import type { FastifyPluginAsync } from "fastify";
import { randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import path from "node:path";

function newCsrfToken(): string {
  return randomBytes(16).toString("hex");
}

function resolveCaptchaDir(): string | null {
  const cwd = process.cwd();
  const candidates = [
    path.resolve(cwd, "../web/public/captcha"),
    path.resolve(cwd, "../../apps/web/public/captcha"),
    path.resolve(cwd, "../apps/web/public/captcha"),
  ];

  for (const p of candidates) {
    if (existsSync(p)) return p;
  }

  return null;
}

function getCsrfFromRequest(req: { cookies: Record<string, unknown>; headers: Record<string, unknown> }): {
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

export const captchaRoutes: FastifyPluginAsync = async (app) => {
  app.get("/api/captcha-images", async (req, reply) => {
    const secure = process.env.NODE_ENV === "production";
    const csrf = newCsrfToken();

    reply.setCookie("webrat_csrf", csrf, {
      path: "/",
      httpOnly: false,
      sameSite: "strict",
      secure,
      maxAge: 2 * 60,
    });

    const dir = resolveCaptchaDir();
    if (!dir) return reply.send([]);

    let files: string[] = [];
    try {
      files = await readdir(dir);
    } catch {
      files = [];
    }

    const originRaw = req.headers.origin;
    const origin = typeof originRaw === "string" && originRaw ? originRaw : "";

    const images = files
      .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f))
      .map((f) => (origin ? `${origin}/captcha/${f}` : `/captcha/${f}`));

    return reply.send(images);
  });

  app.post("/api/captcha-verify", async (req, reply) => {
    const secure = process.env.NODE_ENV === "production";
    const { cookie, header } = getCsrfFromRequest(req);

    if (!cookie) {
      return reply.code(401).send({ error: "captcha_expired" });
    }

    if (!header || header !== cookie) {
      return reply.code(403).send({ error: "captcha_verification_failed" });
    }

    reply.setCookie("webrat_captcha", "1", {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure,
      maxAge: 2 * 60,
    });

    return reply.send({ ok: true });
  });
};
