export function countryCodeToFlagEmoji(countryCodeRaw: string | undefined | null): string {
   const cc = String(countryCodeRaw ?? "").trim();
   if (!cc) return "";

   if ([...cc].length === 2 && /\p{Regional_Indicator}/u.test(cc)) return cc;

   const upper = cc.toUpperCase();
   if (!/^[A-Z]{2}$/.test(upper)) return cc;

   const codePoints = [...upper].map((c) => 0x1f1e6 + (c.charCodeAt(0) - 65));
   return String.fromCodePoint(...codePoints);
}