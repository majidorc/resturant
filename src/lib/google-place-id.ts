export const GOOGLE_PLACE_ID_FINDER_URL =
  "https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder";

export const GOOGLE_WRITEVIEW_BASE = "https://search.google.com/local/writereview?placeid=";

const PLACE_ID_FROM_QUERY = /[?&]placeid=([A-Za-z0-9_-]+)/i;
const PLACE_ID_FROM_MAPS_CID = /!1s(ChI[A-Za-z0-9_-]+)/;
const RAW_PLACE_ID = /^ChI[A-Za-z0-9_-]{10,}$/;

export function extractGooglePlaceId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  const fromQuery = trimmed.match(PLACE_ID_FROM_QUERY);
  if (fromQuery?.[1]) {
    return fromQuery[1];
  }

  const fromMaps = trimmed.match(PLACE_ID_FROM_MAPS_CID);
  if (fromMaps?.[1]) {
    return fromMaps[1];
  }

  if (RAW_PLACE_ID.test(trimmed)) {
    return trimmed;
  }

  return null;
}

export function isValidGooglePlaceId(placeId: string): boolean {
  return RAW_PLACE_ID.test(placeId.trim());
}

export function buildGoogleReviewUrl(placeId: string): string {
  return `${GOOGLE_WRITEVIEW_BASE}${placeId.trim()}`;
}

export function parseGoogleReviewInput(
  raw: string,
): { ok: true; value: string | null } | { ok: false; error: string } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: true, value: null };
  }

  const placeId = extractGooglePlaceId(trimmed);
  if (placeId) {
    if (!isValidGooglePlaceId(placeId)) {
      return { ok: false, error: "Google Place ID format looks invalid." };
    }
    return { ok: true, value: buildGoogleReviewUrl(placeId) };
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return { ok: true, value: trimmed };
  }

  return {
    ok: false,
    error: "Paste a Google Place ID (starts with ChIJ) or a full Google review / Maps link.",
  };
}

export function placeIdFromReviewUrl(url: string | null | undefined): string {
  if (!url) {
    return "";
  }
  return extractGooglePlaceId(url) ?? "";
}
