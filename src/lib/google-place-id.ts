export const GOOGLE_WRITEVIEW_BASE = "https://search.google.com/local/writereview?placeid=";

const PLACE_ID_FROM_QUERY = /[?&]placeid=([A-Za-z0-9_-]+)/i;
const PLACE_ID_FROM_PARAM = /place_id[=:]([A-Za-z0-9_-]+)/i;
const PLACE_ID_FROM_MAPS_BUNDLE = /!1s(ChI[A-Za-z0-9_-]+)/;
const PLACE_ID_ANYWHERE = /(ChI[A-Za-z0-9_-]{10,})/;
const RAW_PLACE_ID = /^ChI[A-Za-z0-9_-]{10,}$/;

function decodeInput(input: string): string {
  try {
    return decodeURIComponent(input);
  } catch {
    return input;
  }
}

const MAPS_HOSTS = new Set([
  "google.com",
  "maps.google.com",
  "maps.app.goo.gl",
  "goo.gl",
]);

export function isGoogleMapsLink(input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return false;
  }

  try {
    const hostname = new URL(trimmed).hostname.replace(/^www\./, "");
    if (MAPS_HOSTS.has(hostname)) {
      return true;
    }
    return hostname.endsWith(".google.com");
  } catch {
    return false;
  }
}

export function extractGooglePlaceId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  if (RAW_PLACE_ID.test(trimmed)) {
    return trimmed;
  }

  const decoded = decodeInput(trimmed);

  const fromQuery = decoded.match(PLACE_ID_FROM_QUERY);
  if (fromQuery?.[1]) {
    return fromQuery[1];
  }

  const fromParam = decoded.match(PLACE_ID_FROM_PARAM);
  if (fromParam?.[1]?.startsWith("ChI")) {
    return fromParam[1];
  }

  const fromMapsBundle = decoded.match(PLACE_ID_FROM_MAPS_BUNDLE);
  if (fromMapsBundle?.[1]) {
    return fromMapsBundle[1];
  }

  const anywhere = decoded.match(PLACE_ID_ANYWHERE);
  if (anywhere?.[1]) {
    return anywhere[1];
  }

  return null;
}

export function isValidGooglePlaceId(placeId: string): boolean {
  return RAW_PLACE_ID.test(placeId.trim());
}

export function buildGoogleReviewUrl(placeId: string): string {
  return `${GOOGLE_WRITEVIEW_BASE}${placeId.trim()}`;
}

export async function resolvePlaceIdFromMapsLink(input: string): Promise<string | null> {
  const local = extractGooglePlaceId(input);
  if (local) {
    return local;
  }

  if (!isGoogleMapsLink(input)) {
    return null;
  }

  try {
    const response = await fetch(input, {
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; ReviewBite/1.0; +https://reviewbite.co)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(10000),
    });

    const fromFinalUrl = extractGooglePlaceId(response.url);
    if (fromFinalUrl) {
      return fromFinalUrl;
    }

    const html = await response.text();
    return extractGooglePlaceId(html);
  } catch {
    return null;
  }
}

export async function parseGoogleReviewInput(
  raw: string,
): Promise<{ ok: true; value: string | null } | { ok: false; error: string }> {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: true, value: null };
  }

  let placeId = extractGooglePlaceId(trimmed);

  if (!placeId && isGoogleMapsLink(trimmed)) {
    placeId = await resolvePlaceIdFromMapsLink(trimmed);
  }

  if (placeId) {
    if (!isValidGooglePlaceId(placeId)) {
      return { ok: false, error: "Google Place ID format looks invalid." };
    }
    return { ok: true, value: buildGoogleReviewUrl(placeId) };
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return {
      ok: false,
      error:
        "Could not read a Place ID from that Google Maps link. Use Share → Copy link from Google Maps.",
    };
  }

  return {
    ok: false,
    error: "Paste a Google Maps link or a Place ID that starts with ChIJ.",
  };
}

export function placeIdFromReviewUrl(url: string | null | undefined): string {
  if (!url) {
    return "";
  }
  return extractGooglePlaceId(url) ?? "";
}
