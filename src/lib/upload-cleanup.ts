import { rm, unlink } from "node:fs/promises";
import path from "node:path";
import {
  UPLOAD_PUBLIC_PREFIX,
  isLegacyUploadPath,
  isRestaurantScopedUploadPath,
  isValidUploadPath,
} from "@/lib/upload-constants";
import { getUploadRoot } from "@/lib/uploads";

export function resolveUploadDiskPath(publicPath: string): string | null {
  if (!isValidUploadPath(publicPath)) {
    return null;
  }

  const relativePath = publicPath.slice(UPLOAD_PUBLIC_PREFIX.length);
  if (!relativePath || relativePath.includes("..") || relativePath.includes("\\")) {
    return null;
  }

  const uploadRoot = path.resolve(getUploadRoot());
  const diskPath = path.resolve(uploadRoot, relativePath);

  if (!diskPath.startsWith(`${uploadRoot}${path.sep}`) && diskPath !== uploadRoot) {
    return null;
  }

  return diskPath;
}

export async function deleteUploadFile(publicPath: string): Promise<void> {
  const diskPath = resolveUploadDiskPath(publicPath);
  if (!diskPath) {
    return;
  }

  try {
    await unlink(diskPath);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") {
      console.error("Failed to delete upload file:", publicPath, error);
    }
  }
}

export async function deleteUploadFiles(publicPaths: string[]): Promise<void> {
  await Promise.all(publicPaths.map((publicPath) => deleteUploadFile(publicPath)));
}

export function getRemovedUploadPaths(previous: string[], next: string[]): string[] {
  const nextSet = new Set(next);
  return previous.filter((publicPath) => !nextSet.has(publicPath));
}

export async function deleteRestaurantUploadDirectory(restaurantId: string): Promise<void> {
  const uploadRoot = path.resolve(getUploadRoot());
  const restaurantDir = path.resolve(uploadRoot, restaurantId);

  if (!restaurantDir.startsWith(`${uploadRoot}${path.sep}`)) {
    return;
  }

  try {
    await rm(restaurantDir, { recursive: true, force: true });
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") {
      console.error("Failed to delete restaurant upload directory:", restaurantId, error);
    }
  }
}

export function collectLegacyUploadPaths(
  restaurantId: string,
  logoUrl: string | null,
  itemImages: string[][],
): string[] {
  const paths = new Set<string>();

  if (logoUrl && isValidUploadPath(logoUrl) && isLegacyUploadPath(logoUrl)) {
    paths.add(logoUrl);
  }

  for (const images of itemImages) {
    for (const imagePath of images) {
      if (
        isValidUploadPath(imagePath) &&
        isLegacyUploadPath(imagePath) &&
        !isRestaurantScopedUploadPath(imagePath, restaurantId)
      ) {
        paths.add(imagePath);
      }
    }
  }

  return [...paths];
}
