function rand(min: number, max: number) {
   return Math.random() * (max - min) + min;
}

let lastSnowOn: boolean | null = null;

function clearSnowflakes() {
   try {
      const flakes = document.querySelectorAll("body .snowflake");
      flakes.forEach((el) => el.parentNode && el.parentNode.removeChild(el));
   } catch {
      return;
   }
}

function createSnowflakes() {
   const root = document.body;
   if (!root) return;
   const existing = root.querySelector(".snowflake");
   if (existing) return;

   const isLogin = (() => {
      try {
         return root.classList.contains("isLoginSnow");
      } catch {
         return false;
      }
   })();

   let hc = 4;
   try {
      const n = (navigator as unknown as { hardwareConcurrency?: unknown }).hardwareConcurrency;
      if (typeof n === "number" && Number.isFinite(n) && n > 0) hc = n;
   } catch {
      hc = 4;
   }

   let vw = 1200;
   try {
      vw = Math.max(320, window.innerWidth || 1200);
   } catch {
      vw = 1200;
   }

   const base = hc <= 4 ? 34 : hc <= 8 ? 54 : 70;
   const scaled = Math.round((vw / 1200) * base);
   const count = isLogin
      ? Math.max(10, Math.min(28, Math.round(scaled * 0.38)))
      : Math.max(24, Math.min(80, scaled));

   const frag = document.createDocumentFragment();

   for (let i = 0; i < count; i += 1) {
      const el = document.createElement("div");
      el.className = "snowflake";

      const inner = document.createElement("span");
      inner.className = "snowflakeInner";
      el.appendChild(inner);

      const size = rand(1.4, isLogin ? 4.2 : 5.2).toFixed(2);
      const alpha = rand(isLogin ? 0.22 : 0.28, isLogin ? 0.72 : 0.9).toFixed(2);
      const x = rand(0, 100).toFixed(2) + "vw";
      const durationVal = isLogin ? rand(5.2, 10.6) : rand(3.6, 7.8);
      const duration = durationVal.toFixed(2) + "s";
      const delay = (-rand(0, durationVal)).toFixed(2) + "s";
      const drift = rand(isLogin ? -10 : -14, isLogin ? 10 : 14).toFixed(2) + "px";
      const blur = "0px";
      const sway = Math.max(1.6, durationVal / 2.8).toFixed(2) + "s";

      el.style.setProperty("--s", size + "px");
      el.style.setProperty("--a", alpha);
      el.style.setProperty("--x", x);
      el.style.setProperty("--d", duration);
      el.style.setProperty("--rx", drift);
      el.style.setProperty("--b", blur);
      el.style.setProperty("--sx", sway);
      el.style.animationDelay = delay;

      frag.appendChild(el);
   }

   root.appendChild(frag);
}

export function applySnow(enabled: boolean) {
   const on = !!enabled;
   if (lastSnowOn === on) return;
   lastSnowOn = on;
   try {
      document.body.classList.toggle("isSnowEnabled", on);
   } catch {
      return;
   }

   if (on) createSnowflakes();
   else clearSnowflakes();
}