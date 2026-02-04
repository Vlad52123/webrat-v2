import { NextResponse } from "next/server";

export async function POST(req: Request) {
   const csrfHeader = req.headers.get("x-csrf-token") ?? "";
   const csrfCookie =
      req.headers
         .get("cookie")
         ?.split(";")
         .map((p) => p.trim())
         .find((p) => p.startsWith("webrat_csrf="))
         ?.split("=")[1] ?? "";

   if (!csrfCookie) {
      return NextResponse.json({ error: "captcha_expired" }, { status: 401 });
   }

   if (!csrfHeader || csrfHeader !== decodeURIComponent(csrfCookie)) {
      return NextResponse.json({ error: "captcha_verification_failed" }, { status: 403 });
   }

   const res = NextResponse.json({ ok: true });
   res.cookies.set({
      name: "webrat_captcha",
      value: "1",
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      maxAge: 2 * 60,
   });
   return res;
}