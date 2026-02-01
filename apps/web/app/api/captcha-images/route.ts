import { NextResponse } from "next/server";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";

export async function GET() {
  const dir = path.join(process.cwd(), "public", "captcha");

  const csrf = randomBytes(16).toString("hex");

  let files: string[] = [];
  try {
    files = await readdir(dir);
  } catch {
    files = [];
  }

  const images = files
    .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f))
    .map((f) => `/captcha/${f}`);

  const res = NextResponse.json(images);
  res.cookies.set({
    name: "webrat_csrf",
    value: csrf,
    path: "/",
    httpOnly: false,
    sameSite: "strict",
    maxAge: 2 * 60,
  });

  return res;
}