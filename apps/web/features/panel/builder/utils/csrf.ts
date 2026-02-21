import { getCookie } from "@/lib/cookie";

export function csrfHeaders(): Record<string, string> {
    const csrf = getCookie("webrat_csrf");
    return csrf ? { "X-CSRF-Token": csrf } : {};
}
