export const MAX_DISH_IMAGES = 3;
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const UPLOAD_PUBLIC_PREFIX = "/uploads/";

export function getUploadPublicPath(fileName: string): string {
  return `${UPLOAD_PUBLIC_PREFIX}${fileName}`;
}

export function isValidUploadPath(value: string): boolean {
  const normalized = value.trim();
  return (
    normalized.startsWith(UPLOAD_PUBLIC_PREFIX) &&
    !normalized.includes("..") &&
    !normalized.includes("\\")
  );
}

export function sanitizeImagePaths(values: string[]): string[] {
  const unique = new Set<string>();

  for (const value of values) {
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (!isValidUploadPath(trimmed)) continue;
    unique.add(trimmed);
    if (unique.size >= MAX_DISH_IMAGES) break;
  }

  return [...unique];
}

export function parseImagesField(raw: FormDataEntryValue | null): string[] {
  if (!raw) return [];

  const value = raw.toString().trim();
  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return sanitizeImagePaths(parsed.filter((entry): entry is string => typeof entry === "string"));
  } catch {
    return [];
  }
}
