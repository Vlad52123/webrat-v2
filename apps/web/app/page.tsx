import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies();
  const sid = cookieStore.get("webrat_session")?.value;
  redirect(sid ? "/panel/#panel" : "/login");
}