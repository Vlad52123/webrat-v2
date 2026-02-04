export function getCookie(name: string): string {
   if (typeof document === "undefined") return "";
   const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${name.replace(/[.*+?^${}()|[\\]\\]/g, "\\\\$&")}=([^;]+)`));
   return m ? decodeURIComponent(m[1] || "") : "";
}

export function csrfHeaders(): Record<string, string> {
   const csrf = getCookie("webrat_csrf");
   return csrf ? { "X-CSRF-Token": csrf } : {};
}
