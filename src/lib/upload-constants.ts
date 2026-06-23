export const MAX_DISH_IMAGES = 3;
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const UPLOAD_PUBLIC_PREFIX = "/uploads/";

const SAFE_SEGMENT = /^[a-zA-Z0-9._-]+$/;

export function getUploadPublicPath(restaurantId: string, fileName: string): string {
  return `${UPLOAD_PUBLIC_PREFIX}${restaurantId}/${fileName}`;
}

export function isLegacyUploadPath(value: string): boolean {
  const normalized = value.trim();
  if (!normalized.startsWith(UPLOAD_PUBLIC_PREFIX)) {
    return false;
  }

  const relative = normalized.slice(UPLOAD_PUBLIC_PREFIX.length);
  return relative.length > 0 && !relative.includes("/");
}

export function isRestaurantScopedUploadPath(value: string, restaurantId: string): boolean {
  const normalized = value.trim();
  const prefix = `${UPLOAD_PUBLIC_PREFIX}${restaurantId}/`;
  return normalized.startsWith(prefix) && normalized.length > prefix.length;
}

export function isValidUploadPath(value: string): boolean {
  const normalized = value.trim();
  if (!normalized.startsWith(UPLOAD_PUBLIC_PREFIX)) {
    return false;
  }

  if (normalized.includes("..") || normalized.includes("\\")) {
    return false;
  }

  const relative = normalized.slice(UPLOAD_PUBLIC_PREFIX.length);
  if (!relative) {
    return false;
  }

  const segments = relative.split("/");
  if (segments.length === 1) {
    return SAFE_SEGMENT.test(segments[0]);
  }

  if (segments.length === 2) {
    return SAFE_SEGMENT.test(segments[0]) && SAFE_SEGMENT.test(segments[1]);
  }

  return false;
}

export function isAllowedUploadPathForRestaurant(
  value: string,
  restaurantId: string,
): boolean {
  if (!isValidUploadPath(value)) {
    return false;
  }

  if (isRestaurantScopedUploadPath(value, restaurantId)) {
    return true;
  }

  return isLegacyUploadPath(value);
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

export function sanitizeImagePathsForRestaurant(
  values: string[],
  restaurantId: string,
): string[] {
  const unique = new Set<string>();

  for (const value of values) {
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (!isAllowedUploadPathForRestaurant(trimmed, restaurantId)) continue;
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

export function parseImagesFieldForRestaurant(
  raw: FormDataEntryValue | null,
  restaurantId: string,
): string[] {
  return sanitizeImagePathsForRestaurant(parseImagesField(raw), restaurantId);
}
