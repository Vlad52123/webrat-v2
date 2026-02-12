import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LandingPage } from "./landing-page";

export default async function Home() {
   const cookieStore = await cookies();
   const sid = cookieStore.get("webrat_session")?.value;
   if (sid) {
      redirect("/panel/#panel");
   }
   return <LandingPage />;
}