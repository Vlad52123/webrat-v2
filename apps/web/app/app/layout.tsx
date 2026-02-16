import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const cookieStore = await cookies();
    const sid = cookieStore.get("webrat_session")?.value;
    if (!sid) {
        redirect("/login");
    }
    return children;
}
