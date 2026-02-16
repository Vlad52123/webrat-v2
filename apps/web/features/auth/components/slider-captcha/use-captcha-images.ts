import { useCallback, useRef } from "react";

export function useCaptchaImages() {
   const imagesCacheRef = useRef<string[] | null>(null);
   const imagesCacheAtRef = useRef<number>(0);

   const listImages = useCallback(async (): Promise<string[]> => {
      try {
         const cached = imagesCacheRef.current;
         const cachedAt = imagesCacheAtRef.current;
         if (cached && cached.length && Date.now() - cachedAt < 5 * 60 * 1000) {
            return cached;
         }

         const res = await fetch(`/api/captcha-images`, {
            method: "GET",
            credentials: "include",
         });
         if (!res.ok) return [];
         const data = (await res.json()) as unknown;
         const list = Array.isArray(data) ? data.map((x) => String(x)) : [];
         imagesCacheRef.current = list;
         imagesCacheAtRef.current = Date.now();
         return list;
      } catch {
         return [];
      }
   }, []);

   const pickImage = useCallback(async (): Promise<string | null> => {
      const imgs = await listImages();
      if (!imgs.length) return null;
      const idx = Math.floor(Math.random() * imgs.length);
      return imgs[idx] ?? null;
   }, [listImages]);

   return { pickImage };
}
