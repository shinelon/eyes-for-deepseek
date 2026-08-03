import { readFile } from "node:fs/promises";
import { extname } from "node:path";

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

const SUPPORTED_EXTS = Object.keys(MIME_BY_EXT);

export async function toDataUrl(src: string): Promise<string> {
  if (/^https?:\/\//i.test(src)) return src;
  if (/^data:/i.test(src)) return src;

  const ext = extname(src).toLowerCase();
  const mime = MIME_BY_EXT[ext];
  if (!mime) {
    throw new Error(
      `Unsupported image extension "${ext}". Supported: ${SUPPORTED_EXTS.join(", ")}`
    );
  }
  const buf = await readFile(src);
  return `data:${mime};base64,${buf.toString("base64")}`;
}
