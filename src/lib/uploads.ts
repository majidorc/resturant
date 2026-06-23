import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import {
  MAX_UPLOAD_BYTES,
  getUploadPublicPath,
} from "@/lib/upload-constants";

export {
  MAX_DISH_IMAGES,
  MAX_UPLOAD_BYTES,
  isValidUploadPath,
  sanitizeImagePaths,
  parseImagesField,
} from "@/lib/upload-constants";

const ALLOWED_MIME_TYPES = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

export function getUploadRoot(): string {
  const configured = process.env.UPLOAD_DIR?.trim();
  if (configured) {
    return path.isAbsolute(configured)
      ? configured
      : path.join(/* turbopackIgnore: true */ process.cwd(), configured);
  }
  return path.join(/* turbopackIgnore: true */ process.cwd(), "public", "uploads");
}

function buildUploadPublicPath(fileName: string): string {
  return getUploadPublicPath(fileName);
}

export async function saveUploadedImage(file: File): Promise<string> {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error("Unsupported image type. Use JPEG, PNG, WebP, or GIF.");
  }

  if (file.size <= 0) {
    throw new Error("Uploaded file is empty.");
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Image exceeds the 5 MB size limit.");
  }

  const extension = ALLOWED_MIME_TYPES.get(file.type)!;
  const fileName = `${Date.now()}-${randomUUID()}.${extension}`;
  const uploadRoot = getUploadRoot();
  const destination = path.join(uploadRoot, fileName);

  await mkdir(uploadRoot, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(destination, buffer);

  return buildUploadPublicPath(fileName);
}
