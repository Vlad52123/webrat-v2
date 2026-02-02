export type BgMode = "image" | "video" | "default";

let currentBgVideoObjectUrl = "";

function safeUrl(v: string) {
  return `url("${String(v || "").replace(/\"/g, "")}")`;
}

export function applyBackgroundImage(target: HTMLElement, dataUrl: string, previewEl?: HTMLElement | null) {
  const v = String(dataUrl || "").trim();
  if (!v) {
    target.style.backgroundImage = "";
    if (previewEl) previewEl.style.backgroundImage = "";
    return;
  }
  target.style.backgroundImage = safeUrl(v);
  target.style.backgroundSize = "cover";
  target.style.backgroundPosition = "center";
  target.style.backgroundRepeat = "no-repeat";
  if (previewEl) previewEl.style.backgroundImage = safeUrl(v);
}

export function applyBackgroundColor(target: HTMLElement, color: string, previewEl?: HTMLElement | null) {
  const v = String(color || "").trim();
  if (!v) return;
  target.style.backgroundColor = v;
  if (previewEl) previewEl.style.backgroundColor = v;
}

export function clearBackgroundColor(target: HTMLElement, previewEl?: HTMLElement | null) {
  target.style.backgroundColor = "";
  if (previewEl) previewEl.style.backgroundColor = "";
}

export function revokeBgVideoUrl() {
  if (!currentBgVideoObjectUrl) return;
  try {
    URL.revokeObjectURL(currentBgVideoObjectUrl);
  } catch {
    return;
  }
  currentBgVideoObjectUrl = "";
}

export function applyBackgroundVideo(target: HTMLElement, objectUrl: string, previewEl?: HTMLElement | null) {
  const v = String(objectUrl || "").trim();

  if (currentBgVideoObjectUrl && currentBgVideoObjectUrl !== v) {
    revokeBgVideoUrl();
  }

  let video = target.querySelector<HTMLVideoElement>("#uiBgVideo");

  if (!v) {
    if (video && video.parentNode) video.parentNode.removeChild(video);
    if (previewEl) {
      try {
        const pv = previewEl.querySelector("video");
        if (pv && pv.parentNode) pv.parentNode.removeChild(pv);
      } catch {
        return;
      }
    }
    return;
  }

  if (!video) {
    video = document.createElement("video");
    video.id = "uiBgVideo";
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.style.pointerEvents = "none";
    video.style.position = "absolute";
    video.style.inset = "0";
    video.style.width = "100%";
    video.style.height = "100%";
    video.style.objectFit = "cover";
    video.style.zIndex = "-1";
    target.style.position = "relative";
    target.insertBefore(video, target.firstChild);
  }

  currentBgVideoObjectUrl = v;
  video.src = v;

  if (previewEl) {
    try {
      let pv = previewEl.querySelector<HTMLVideoElement>("video");
      if (!pv) {
        pv = document.createElement("video");
        pv.autoplay = true;
        pv.loop = true;
        pv.muted = true;
        pv.playsInline = true;
        pv.style.width = "100%";
        pv.style.height = "100%";
        pv.style.objectFit = "contain";
        previewEl.appendChild(pv);
      }
      pv.src = v;
    } catch {
      return;
    }
  }
}