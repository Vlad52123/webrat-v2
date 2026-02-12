import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { LandingPage } from "./landing-page";

const BOT_PATTERNS = [
   "bot", "crawl", "spider", "slurp", "mediapartners",
   "facebookexternalhit", "linkedinbot", "twitterbot",
   "whatsapp", "telegrambot", "discordbot", "bingpreview",
   "yandex", "baidu", "duckduckbot", "sogou", "exabot",
   "ia_archiver", "semrush", "ahrefs", "mj12bot", "dotbot",
   "petalbot", "bytespider", "gptbot", "claudebot",
   "googlebot", "google-inspectiontool", "storebot-google",
];

function isBot(ua: string): boolean {
   const lower = ua.toLowerCase();
   return BOT_PATTERNS.some((p) => lower.includes(p));
}

export default async function Home() {
   const cookieStore = await cookies();
   const sid = cookieStore.get("webrat_session")?.value;
   if (sid) {
      redirect("/panel/#panel");
   }

   const headersList = await headers();
   const ua = headersList.get("user-agent") || "";

   if (isBot(ua)) {
      return <LandingPage />;
   }

   redirect("/login/");
}