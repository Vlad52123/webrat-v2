let rgbAnimationId: number | null = null;
let rgbLastTs: number | null = null;
let rgbHue = 0;
let baseLineColor = "";
let rgbLastApplyTs: number | null = null;

function step(ts: number) {
  if (!document.body.classList.contains("isRgbLine")) {
    rgbAnimationId = null;
    rgbLastTs = null;
    rgbLastApplyTs = null;
    return;
  }

  if (document.visibilityState === "hidden") {
    rgbAnimationId = window.requestAnimationFrame(step);
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
  try {
    document.body.classList.toggle("isRgbLine", enabled);
  } catch {
    return;
  }

  if (enabled) {
    if (rgbAnimationId == null) {
      rgbLastTs = null;
      rgbLastApplyTs = null;
      rgbAnimationId = window.requestAnimationFrame(step);
    }
    return;
  }

  if (rgbAnimationId != null) {
    window.cancelAnimationFrame(rgbAnimationId);
    rgbAnimationId = null;
    rgbLastTs = null;
    rgbLastApplyTs = null;
  }

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