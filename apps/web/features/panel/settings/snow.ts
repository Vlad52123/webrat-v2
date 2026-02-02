function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

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

  const count = 120;

  for (let i = 0; i < count; i += 1) {
    const el = document.createElement("div");
    el.className = "snowflake";

    const inner = document.createElement("span");
    inner.className = "snowflakeInner";
    el.appendChild(inner);

    const size = rand(2, 6.5).toFixed(2);
    const alpha = rand(0.28, 0.9).toFixed(2);
    const x = rand(0, 100).toFixed(2) + "vw";
    const durationVal = rand(3.6, 7.8);
    const duration = durationVal.toFixed(2) + "s";
    const delay = (-rand(0, durationVal)).toFixed(2) + "s";
    const drift = rand(-34, 34).toFixed(2) + "px";
    const blur = rand(0, 1.1).toFixed(2) + "px";
    const sway = Math.max(1.6, durationVal / 2.8).toFixed(2) + "s";

    el.style.setProperty("--s", size + "px");
    el.style.setProperty("--a", alpha);
    el.style.setProperty("--x", x);
    el.style.setProperty("--d", duration);
    el.style.setProperty("--rx", drift);
    el.style.setProperty("--b", blur);
    el.style.setProperty("--sx", sway);
    el.style.animationDelay = delay;

    root.appendChild(el);
  }
}

export function applySnow(enabled: boolean) {
  const on = !!enabled;
  try {
    document.body.classList.toggle("isSnowEnabled", on);
  } catch {
    return;
  }

  if (on) createSnowflakes();
  else clearSnowflakes();
}