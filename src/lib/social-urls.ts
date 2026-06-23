export function parseOptionalHttpUrl(
  raw: FormDataEntryValue | null,
  fieldLabel: string,
): { ok: true; value: string | null } | { ok: false; error: string } {
  const trimmed = raw?.toString().trim() ?? "";
  if (!trimmed) {
    return { ok: true, value: null };
  }

  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return {
      ok: false,
      error: `${fieldLabel} must start with http:// or https://.`,
    };
  }

  return { ok: true, value: trimmed };
}

export function isOptimalGoogleReviewUrl(url: string): boolean {
  const normalized = url.trim();
  if (!normalized) {
    return true;
  }

  return (
    normalized.includes("writereview?placeid=") ||
    normalized.includes("search.google.com")
  );
}
