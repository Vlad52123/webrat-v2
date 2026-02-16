import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { LoginPage } from "./login-page";

export default async function Page() {
    const c = await cookies();
    const session = c.get("webrat_session")?.value || "";
    if (session) {
        redirect("/panel/#panel");
    }
    return <LoginPage />;
}
