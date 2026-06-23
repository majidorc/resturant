import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRequiredRestaurantId } from "@/lib/session";
import {
  extractGooglePlaceId,
  isGoogleMapsLink,
  resolvePlaceIdFromMapsLink,
} from "@/lib/google-place-id";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role === "SUPERADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await getRequiredRestaurantId();

    const body: unknown = await request.json();
    const url = typeof body === "object" && body && "url" in body ? String(body.url).trim() : "";

    if (!url) {
      return NextResponse.json({ success: false, error: "No URL provided." }, { status: 400 });
    }

    const local = extractGooglePlaceId(url);
    if (local) {
      return NextResponse.json({ success: true, placeId: local });
    }

    if (!isGoogleMapsLink(url)) {
      return NextResponse.json(
        { success: false, error: "Paste a valid Google Maps link." },
        { status: 400 },
      );
    }

    const placeId = await resolvePlaceIdFromMapsLink(url);
    if (!placeId) {
      const needsApiKey = !process.env.GOOGLE_PLACES_API_KEY?.trim();
      return NextResponse.json(
        {
          success: false,
          error: needsApiKey
            ? "Could not resolve Place ID from that link. Ask your admin to set GOOGLE_PLACES_API_KEY, or paste a Place ID starting with ChIJ."
            : "Could not find this business on Google Maps. Double-check the Share link and try again.",
        },
        { status: 422 },
      );
    }

    return NextResponse.json({ success: true, placeId });
  } catch {
    return NextResponse.json({ success: false, error: "Resolution failed." }, { status: 500 });
  }
}
