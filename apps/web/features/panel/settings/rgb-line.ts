let rgbAnimationId: number | null = null;
let rgbLastTs: number | null = null;
let rgbHue = 0;
let baseLineColor = "";
let rgbLastApplyTs: number | null = null;

let lastRgbOn: boolean | null = null;
let visibilityHandlerInstalled = false;

function stopLoop() {
  if (rgbAnimationId != null) {
    window.cancelAnimationFrame(rgbAnimationId);
    rgbAnimationId = null;
  }
  rgbLastTs = null;
  rgbLastApplyTs = null;
}

function onVisibilityChange() {
  try {
    if (document.visibilityState === "hidden") {
      stopLoop();
      return;
    }

    if (!document.body.classList.contains("isRgbLine")) {
      stopLoop();
      return;
    }

    if (rgbAnimationId == null) {
      rgbLastTs = null;
      rgbLastApplyTs = null;
      rgbAnimationId = window.requestAnimationFrame(step);
    }
  } catch {
    return;
  }
}

function step(ts: number) {
  if (!document.body.classList.contains("isRgbLine")) {
    rgbAnimationId = null;
    rgbLastTs = null;
    rgbLastApplyTs = null;
    return;
  }

  if (document.visibilityState === "hidden") {
    rgbAnimationId = null;
    rgbLastTs = null;
    rgbLastApplyTs = null;
    return;
  }

  if (rgbLastTs == null) rgbLastTs = ts;
  const delta = ts - rgbLastTs;
  rgbLastTs = ts;

  const huePerMs = 60 / 1000;
  rgbHue = (rgbHue + delta * huePerMs) % 360;

  if (rgbLastApplyTs == null) rgbLastApplyTs = ts;
  const applyDelta = ts - rgbLastApplyTs;
  if (applyDelta >= 33) {
    rgbLastApplyTs = ts;
    const colorLine = `hsl(${rgbHue.toFixed(2)} 95% 60%)`;
    try {
      document.documentElement.style.setProperty("--line", colorLine);
    } catch {
      return;
    }
  }

  rgbAnimationId = window.requestAnimationFrame(step);
}

export function setBaseLineColor(value: string) {
  baseLineColor = String(value || "").trim();
}

export function applyLineColor(value: string) {
  const v = String(value || "").trim();
  if (!v) {
    try {
      document.documentElement.style.removeProperty("--line");
    } catch {
      return;
    }
    return;
  }

  try {
    document.documentElement.style.setProperty("--line", v);
  } catch {
    return;
  }
}

export function enableRgbLines(on: boolean) {
  const enabled = !!on;
  if (lastRgbOn === enabled) return;
  lastRgbOn = enabled;
  try {
    document.body.classList.toggle("isRgbLine", enabled);
  } catch {
    return;
  }

  if (enabled) {
    if (!visibilityHandlerInstalled) {
      visibilityHandlerInstalled = true;
      document.addEventListener("visibilitychange", onVisibilityChange);
    }
    onVisibilityChange();
    return;
  }

  if (visibilityHandlerInstalled) {
    visibilityHandlerInstalled = false;
    document.removeEventListener("visibilitychange", onVisibilityChange);
  }

  stopLoop();

  if (baseLineColor) {
    try {
      document.documentElement.style.setProperty("--line", baseLineColor);
    } catch {
      return;
    }
  } else {
    try {
      document.documentElement.style.removeProperty("--line");
    } catch {
      return;
    }
  }
}