export const GOOGLE_WRITEVIEW_BASE = "https://search.google.com/local/writereview?placeid=";

const PLACE_ID_FROM_QUERY = /[?&]placeid=([A-Za-z0-9_-]+)/i;
const PLACE_ID_FROM_PARAM = /place_id["'=:\s]+(ChI[A-Za-z0-9_-]+)/i;
const PLACE_ID_FROM_MAPS_BUNDLE = /!1s(ChI[A-Za-z0-9_-]+)/;
const PLACE_ID_ANYWHERE = /(ChI[A-Za-z0-9_-]{18,})/g;
const RAW_PLACE_ID = /^ChI[A-Za-z0-9_-]{18,}$/;
const MAPS_BUSINESS_NAME = /\/maps\/place\/([^/@?]+)/i;
const MAPS_COORDINATES = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
const MAPS_HEX_FEATURE_ID = /!1s0x[a-fA-F0-9]+:(0x[a-fA-F0-9]+)/;

const MAPS_HOSTS = new Set([
  "google.com",
  "maps.google.com",
  "maps.app.goo.gl",
  "goo.gl",
]);

// Google serves JS shell (no redirect) to full Chrome UAs; a minimal UA gets HTTP 302.
const REDIRECT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; ReviewBite/1.0)",
  Accept: "*/*",
};

const FETCH_HEADERS = {
  ...REDIRECT_HEADERS,
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

function decodeInput(input: string): string {
  try {
    return decodeURIComponent(input);
  } catch {
    return input;
  }
}

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

export function parseMapsBusinessName(input: string): string | null {
  const decoded = decodeInput(input.trim());
  const match = decoded.match(MAPS_BUSINESS_NAME);
  if (!match?.[1]) {
    return null;
  }

  const name = match[1].replace(/\+/g, " ").trim();
  return name.length > 0 ? name : null;
}

export function parseMapsCoordinates(
  input: string,
): { lat: number; lng: number } | null {
  const decoded = decodeInput(input.trim());
  const match = decoded.match(MAPS_COORDINATES);
  if (!match) {
    return null;
  }

  const lat = Number(match[1]);
  const lng = Number(match[2]);
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return null;
  }

  return { lat, lng };
}

/** Decimal Google CID embedded in modern Maps URLs (`!1s0x…:0x…`). */
export function parseMapsCid(input: string): string | null {
  const decoded = decodeInput(input.trim());
  const match = decoded.match(MAPS_HEX_FEATURE_ID);
  if (!match?.[1]) {
    return null;
  }

  try {
    return BigInt(match[1]).toString();
  } catch {
    return null;
  }
}

function findPlaceIdInText(text: string): string | null {
  const matches = [...text.matchAll(PLACE_ID_ANYWHERE)].map((match) => match[1]);
  const valid = matches.filter((candidate) => isValidGooglePlaceId(candidate));
  if (valid.length === 0) {
    return null;
  }

  return valid.sort((a, b) => b.length - a.length)[0];
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
  if (fromParam?.[1]) {
    return fromParam[1];
  }

  const fromMapsBundle = decoded.match(PLACE_ID_FROM_MAPS_BUNDLE);
  if (fromMapsBundle?.[1]) {
    return fromMapsBundle[1];
  }

  return findPlaceIdInText(decoded);
}

export function isValidGooglePlaceId(placeId: string): boolean {
  return RAW_PLACE_ID.test(placeId.trim());
}

export function buildGoogleReviewUrl(placeId: string): string {
  return `${GOOGLE_WRITEVIEW_BASE}${placeId.trim()}`;
}

async function followMapsRedirects(input: string, maxHops = 10): Promise<string> {
  let current = input.trim();

  for (let hop = 0; hop < maxHops; hop += 1) {
    const local = extractGooglePlaceId(current);
    if (local) {
      return current;
    }

    const response = await fetch(current, {
      redirect: "manual",
      headers: REDIRECT_HEADERS,
      signal: AbortSignal.timeout(10000),
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) {
        break;
      }
      current = new URL(location, current).toString();
      continue;
    }

    return current;
  }

  return current;
}

async function fetchMapsHtml(expandedUrl: string): Promise<{ finalUrl: string; html: string } | null> {
  try {
    const response = await fetch(expandedUrl, {
      redirect: "follow",
      headers: FETCH_HEADERS,
      signal: AbortSignal.timeout(15000),
    });

    const html = await response.text();
    return { finalUrl: response.url, html };
  } catch {
    return null;
  }
}

async function placeIdFromCidViaPlacesApi(cid: string): Promise<string | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  const params = new URLSearchParams({
    cid,
    fields: "place_id",
    key: apiKey,
  });

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`,
      { signal: AbortSignal.timeout(10000) },
    );

    if (!response.ok) {
      return null;
    }

    const data: {
      status?: string;
      result?: { place_id?: string };
    } = await response.json();

    if (data.status !== "OK") {
      console.error("[Places API] place details (cid) status:", data.status);
      return null;
    }

    const placeId = data.result?.place_id;
    return placeId && isValidGooglePlaceId(placeId) ? placeId : null;
  } catch (error) {
    console.error("[Places API] place details (cid) failed:", error);
    return null;
  }
}

async function searchPlaceIdViaGooglePlacesApi(
  businessName: string,
  coordinates?: { lat: number; lng: number } | null,
): Promise<string | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  const params = new URLSearchParams({
    input: businessName,
    inputtype: "textquery",
    fields: "place_id",
    key: apiKey,
  });

  if (coordinates) {
    params.set(
      "locationbias",
      `circle:800@${coordinates.lat},${coordinates.lng}`,
    );
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?${params.toString()}`,
      { signal: AbortSignal.timeout(10000) },
    );

    if (!response.ok) {
      return null;
    }

    const data: {
      status?: string;
      candidates?: Array<{ place_id?: string }>;
    } = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("[Places API] findplacefromtext status:", data.status);
      return null;
    }

    const placeId = data.candidates?.[0]?.place_id;
    return placeId && isValidGooglePlaceId(placeId) ? placeId : null;
  } catch (error) {
    console.error("[Places API] findplacefromtext failed:", error);
    return null;
  }
}

export async function resolvePlaceIdFromMapsLink(input: string): Promise<string | null> {
  const local = extractGooglePlaceId(input);
  if (local) {
    return local;
  }

  if (!isGoogleMapsLink(input)) {
    return null;
  }

  const expandedUrl = await followMapsRedirects(input);
  const expandedLocal = extractGooglePlaceId(expandedUrl);
  if (expandedLocal) {
    return expandedLocal;
  }

  const cid = parseMapsCid(input) ?? parseMapsCid(expandedUrl);
  if (cid) {
    const fromCid = await placeIdFromCidViaPlacesApi(cid);
    if (fromCid) {
      return fromCid;
    }
  }

  const fetched = await fetchMapsHtml(expandedUrl);
  if (fetched) {
    const fromFinalUrl = extractGooglePlaceId(fetched.finalUrl);
    if (fromFinalUrl) {
      return fromFinalUrl;
    }

    const fromHtml = findPlaceIdInText(fetched.html);
    if (fromHtml) {
      return fromHtml;
    }
  }

  const businessName =
    parseMapsBusinessName(input) ??
    parseMapsBusinessName(expandedUrl) ??
    parseMapsBusinessName(fetched?.finalUrl ?? "");
  if (businessName) {
    const coordinates =
      parseMapsCoordinates(input) ??
      parseMapsCoordinates(expandedUrl) ??
      parseMapsCoordinates(fetched?.finalUrl ?? "");
    const fromApi = await searchPlaceIdViaGooglePlacesApi(businessName, coordinates);
    if (fromApi) {
      return fromApi;
    }
  }

  return null;
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
    if (!process.env.GOOGLE_PLACES_API_KEY?.trim()) {
      return {
        ok: false,
        error:
          "Could not resolve Place ID from that Maps link. Add GOOGLE_PLACES_API_KEY on the server, or paste a direct Place ID (ChIJ…).",
      };
    }

    return {
      ok: false,
      error:
        "Could not find this business on Google Maps. Double-check the Share link and try again.",
    };
  }

  return {
    ok: false,
    error: "Paste a Google Maps share link or a Place ID that starts with ChIJ.",
  };
}

export function placeIdFromReviewUrl(url: string | null | undefined): string {
  if (!url) {
    return "";
  }
  return extractGooglePlaceId(url) ?? "";
}
