import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { optimizeImageBuffer } from "@/lib/image-processing";
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

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
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

  const uploadRoot = getUploadRoot();
  await mkdir(uploadRoot, { recursive: true });

  const inputBuffer = Buffer.from(await file.arrayBuffer());
  const optimizedBuffer = await optimizeImageBuffer(inputBuffer, file.type);
  const fileName = `${Date.now()}-${randomUUID()}.webp`;
  const destination = path.join(uploadRoot, fileName);

  await writeFile(destination, optimizedBuffer);

  return buildUploadPublicPath(fileName);
}
