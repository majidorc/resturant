# ReviewBite — Deep Code Review

**Date:** 2026-06-23  
**Last updated:** 2026-06-23 (post v0.2.1 fixes)

---

## Resolved in v0.2.1

- Cron `CRON_SECRET` fail-closed + timing-safe comparison
- Atomic cron email claim + revert on failure
- Cron `isActive` filter + production 23–25h window defaults
- Unique `(restaurantId, email)` + upsert on Wi-Fi unlock
- Feedback `isActive` check + comment length limit
- Review page `isActive` + i18n + positive thank-you without Google URL
- Deactivated tenant dashboard blocked
- Production seed wipe guard (`SEED_FORCE`)
- CSV formula injection neutralization
- Export API 403 for non-superadmin
- Server-only lead `source` field

---

## Still Open (accepted or future work)

### Wi-Fi credential disclosure (IDOR by design)

`restaurantId` is public on the menu page. Wi-Fi unlock returns credentials for any valid ID. Duplicate emails skip new leads but still return passwords. Mitigation would require signed tokens or session-bound unlock — not implemented.

### Open tenant self-registration

No invite flow, captcha, or rate limiting on `/register` or Wi-Fi unlock.

### Middleware does not cover API routes

Each `/api/*` route must self-protect. Current routes are audited; new routes need the same discipline.

### Wi-Fi passwords stored in plaintext

Required for guest display after email capture.

### Lead ID on review page

CUID in email links is guess-resistant but not secret once leaked.

### Admin leads UI capped at 500 rows

Export returns all leads; table preview truncates.

### Docker migrations not automatic

Run `npm run db:migrate:deploy` manually after deploy.

### Demo seed credentials in repo

Change passwords in production; seed only on empty DB or with `SEED_FORCE=true`.

---

## Summary Matrix (after v0.2.1)

| Area | Status |
|------|--------|
| Auth bypass on admin/dashboard pages | Solid |
| API route protection | Improved |
| `isActive` enforcement | Broad coverage |
| Data integrity | Unique leads + atomic cron |
| Production readiness | Cron/seed/export hardened |
| i18n | Review flow wired |
| Schema/migrations | Aligned |
