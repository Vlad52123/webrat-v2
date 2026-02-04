import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

export default async function CatchAllPage(props: { params: { path?: string[] } }) {
   const seg0 = props.params?.path?.[0] ?? "";
   if (seg0 === "_next" || seg0 === "favicon.ico" || seg0 === "robots.txt" || seg0 === "sitemap.xml") {
      notFound();
   }

   const cookieStore = await cookies();
   const sid = cookieStore.get("webrat_session")?.value;
   if (sid) {
      redirect("/panel/#panel");
   }
   redirect("/login");
}