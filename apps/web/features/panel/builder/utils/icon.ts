import { showToastSafe } from "./toast";

export type ReadIcoResult = {
  name: string;
  base64: string;
};

export async function readIcoAsBase64(file: File): Promise<ReadIcoResult | null> {
  const name = String(file?.name || "");
  const lower = name.toLowerCase();

  if (!lower.endsWith(".ico")) {
    showToastSafe("warning", "Icon must be .ico");
    return null;
  }

  const maxBytes = 512 * 1024;
  if (typeof file.size === "number" && file.size > maxBytes) {
    showToastSafe("warning", "Icon too large (max 512KB)");
    return null;
  }

  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  const headOk = bytes.length >= 4 && bytes[0] === 0 && bytes[1] === 0 && bytes[2] === 1 && bytes[3] === 0;
  if (!headOk) {
    showToastSafe("warning", "Invalid .ico file");
    return null;
  }

  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);

  return {
    name,
    base64: btoa(bin),
  };
}
