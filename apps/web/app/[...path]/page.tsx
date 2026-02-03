import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function CatchAllPage() {
  const cookieStore = await cookies();
  const sid = cookieStore.get("webrat_session")?.value;
  if (sid) {
    redirect("/panel/#panel");
  }
  redirect("/login");
}
