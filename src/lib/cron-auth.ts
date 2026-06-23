import { timingSafeEqual } from "node:crypto";

export function getCronSecret(): string | null {
  const secret = process.env.CRON_SECRET?.trim();
  return secret ? secret : null;
}

export function isValidCronRequest(authHeader: string | null): boolean {
  const secret = getCronSecret();
  if (!secret) {
    return false;
  }

  const expected = `Bearer ${secret}`;
  if (!authHeader || authHeader.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected));
}
