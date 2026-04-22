import path from "node:path";
import { promises as fs } from "node:fs";
import crypto from "node:crypto";

const EMAIL_ASSETS_DIR = path.join(process.cwd(), "storage", "email-assets");

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
]);

export function normalizeContentId(value?: string | null) {
  return value?.trim().replace(/^<|>$/g, "") || null;
}

export function isAllowedAssetMimeType(value?: string | null) {
  return Boolean(value && ALLOWED_IMAGE_MIME_TYPES.has(value.toLowerCase()));
}

export function getAssetStoragePath(fileName: string) {
  return path.join(EMAIL_ASSETS_DIR, fileName);
}

export async function ensureEmailAssetsDir() {
  await fs.mkdir(EMAIL_ASSETS_DIR, { recursive: true });
}

export async function saveEmailAsset(buffer: Buffer, mimeType: string) {
  await ensureEmailAssetsDir();

  const extension = mimeType.split("/")[1] || "bin";
  const fileName = `${crypto.randomUUID()}.${extension}`;
  const filePath = getAssetStoragePath(fileName);

  await fs.writeFile(filePath, buffer);

  return { fileName, filePath, sizeBytes: buffer.byteLength };
}

export async function deleteStoredAsset(fileName?: string | null) {
  if (!fileName) return;

  try {
    await fs.unlink(getAssetStoragePath(fileName));
  } catch {
    // ignore missing files
  }
}

export function rewriteCidSources(html: string, assets: Array<{ id: number; contentId: string }>, jwt: string) {
  let output = html;

  for (const asset of assets) {
    const escapedContentId = asset.contentId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const cidPattern = new RegExp(`(["'])cid:${escapedContentId}\\1`, "gi");
    output = output.replace(cidPattern, `$1/api/email-assets/${asset.id}?jwt=${encodeURIComponent(jwt)}$1`);
  }

  return output;
}
