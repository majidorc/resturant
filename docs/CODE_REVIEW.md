# MenuHub — Deep Code Review

**Date:** 2026-06-23  
**Scope:** Full codebase audit (auth, APIs, admin, tenant dashboard, cron, mailer, schema, Docker, i18n)

---

## What's Working Well

- **Auth & role isolation** — Middleware guards `/dashboard/*` and `/admin/*`. Admin layout re-checks super admin. Server actions use role-specific session helpers. Menu mutations verify restaurant ownership.
- **Recent admin features** — Lead export and restaurant activate/deactivate/delete are super-admin gated. Export API checks session + role. `isActive` enforced on public menu and Wi-Fi unlock.
- **Data model** — Cascade deletes wired correctly across restaurants, menus, leads, and feedback.
- **Mailer & cron** — HTML escaped in email template. Per-lead failure isolation; `emailSent` only after successful delivery.
- **i18n** — Landing, auth, dashboard, admin, Wi-Fi gate, and public menu localized (EN/TH). Review guest flow still hardcoded English.

---

## CRITICAL

### 1. Production seed wipes entire database

`prisma/seed.ts` deletes all rows before insert. Re-running seed in production destroys all tenant data. Only safe on first empty deploy.

### 2. Cron auth bypass when `CRON_SECRET` is unset

```typescript
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
```

If `CRON_SECRET` is missing, `Bearer undefined` is a valid token. Anyone can trigger review emails.

### 3. Public Wi-Fi credential disclosure (IDOR by design)

`restaurantId` is exposed on the public menu. Any caller with that ID receives Wi-Fi credentials. Duplicate emails skip lead creation but still return credentials.

---

## HIGH

### 4. `/api/feedback` — no auth, no `isActive`, arbitrary `restaurantId`

No link to a customer lead, no rate limiting, no active-restaurant check. Attackers can spam feedback for any venue including deactivated ones.

### 5. `/review/[leadId]` — no `isActive` check

Deactivated restaurants still serve review flows and Google redirects.

### 6. Broken positive-review path when `googleReviewUrl` is missing

If `?satisfied=true` but no Google URL is configured, the negative-feedback UI is shown instead of a thank-you state.

### 7. Duplicate leads — no DB uniqueness + race condition

Schema has no unique constraint on `(restaurantId, email)`. Concurrent unlock requests can insert duplicates.

### 8. Cron duplicate-email race

Two cron workers can both read `emailSent: false`, send mail, and both update. No atomic claim.

### 9. Cron ignores `isActive`

Pending leads for deactivated restaurants are still emailed.

### 10. `isActive` not enforced on tenant dashboard

Deactivated tenants retain full dashboard access. Only public menu and Wi-Fi API are blocked.

### 11. Review flow ignores i18n

Review page and feedback form use hardcoded English despite dictionary keys existing.

### 12. Production cron window still in test mode

Defaults are 50–70 minutes, not 23–25 hours. README describes ~24 hours while code ships test windows unless env vars override.

---

## MEDIUM

- CSV formula injection in export (values starting with `=`, `+`, `-`, `@` not neutralized)
- Client-controlled `source` field on Wi-Fi unlock
- Admin leads UI capped at 500 rows; export returns all
- Dead `/admin/feedback` redirect and stale README references
- README says mock mailer; code uses live Resend
- Feedback API has no comment length limit
- Docker container does not auto-run migrations on start
- Weak demo credentials published in seed and README

---

## LOW

- Middleware does not cover API routes (each route must self-protect)
- Open tenant self-registration with no invite or rate limit
- Wi-Fi passwords stored in plaintext (expected for guest display)
- Lead ID enumeration on review page (CUIDs not secret once emailed)
- Export API returns 401 instead of 403 for non-superadmin
- Build script uses `next build`; Dockerfile uses `next build --webpack`

---

## Recommended Fix Order

1. Require non-empty `CRON_SECRET`; fail closed if missing.
2. Add `@@unique([restaurantId, email])` + upsert in unlock-wifi.
3. Add `isActive` checks to feedback API, review page, and cron query.
4. Atomic cron claim before send (`updateMany` with `emailSent: false` guard).
5. Wire review pages to i18n dictionaries; fix `satisfied=true` fallback when no Google URL.
6. Guard production seed (env flag or skip wipe when data exists).
7. Neutralize CSV formula injection; set production cron window via env (1380–1500 minutes).

---

## Summary Matrix

| Area | Status |
|------|--------|
| Auth bypass on admin/dashboard pages | Solid |
| API route protection | Mixed |
| `isActive` enforcement | Partial |
| Data integrity | Good cascades; weak lead dedup + cron concurrency |
| Production readiness | Cron window, CRON_SECRET, seed wipe, Resend env need attention |
| i18n | Good except review/feedback guest flow |
| Schema/migrations | Aligned |
