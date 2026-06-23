# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

_No unreleased changes._

---

## [0.7.3] - 2026-06-23

### Changed

- Production deploy flow restored to Coolify Dockerfile auto-deploy on git push; GHCR workflow is manual-only to avoid duplicate builds.

---

## [0.7.1] - 2026-06-23

### Fixed

- Install `curl` in the production Docker image so Coolify healthchecks pass during GHCR pull deploys.

---

## [0.7.0] - 2026-06-23

### Added

- Restaurant social media fields (Instagram, Facebook, TikTok, WhatsApp) in settings and on the public menu header.
- Google Review direct-link pro tip and client-side validation warning for non-optimal URLs.

---

## [0.6.3] - 2026-06-23

### Changed

- Uploads are stored per restaurant at `/uploads/{restaurantId}/` for isolated storage and simpler cleanup.
- Deleting a restaurant removes its upload folder and any legacy flat files still on disk.
- Existing flat `/uploads/{filename}` paths remain supported for older images.

---

## [0.6.2] - 2026-06-23

### Fixed

- Runtime uploads (WebP and new images) now serve correctly in standalone production via `/api/serve-upload` rewrite.
- Resolves 404s for dish images uploaded after a container restart.

---

## [0.6.1] - 2026-06-23

### Changed

- Dockerfile switched to Debian slim for reliable `sharp` and `npm ci` in CI.
- GitHub Actions now builds on cloud runners and optionally triggers Coolify pull-only deploy.
- Coolify auto-deploy on git push disabled server-side to prevent 200% CPU on-server builds.

---

## [0.6.0] - 2026-06-23

### Added

- Premium language dropdown with globe trigger, popover list, and active-state styling.
- Server-side image optimization via `sharp` (WebP, max 1024px, quality 82) on upload.
- Upload garbage collection when menu items are deleted or images are removed/replaced.
- Logo file cleanup when restaurant logo is replaced in settings.
- Public menu image lightbox with ESC, overlay click, and close button dismiss.
- Menu item delete action in tenant menu manager.

### Changed

- `LanguageSwitcher` refactored from horizontal pill buttons to compact dropdown.
- All uploaded images stored as optimized `.webp` files.

---

## [0.5.1] - 2026-06-22

### Added

- GitHub Actions workflow (`.github/workflows/docker-publish.yml`) builds the Docker image on GitHub runners and pushes to `ghcr.io/majidorc/resturant` so Coolify can **pull** instead of building on the Hetzner CX23.

### Changed

- Dockerfile runner stage pre-creates `public/uploads` for persistent volume mounts.

---

## [0.5.0] - 2026-06-22

### Added

- Local image upload API at `/api/upload` (tenant-authenticated, JPEG/PNG/WebP/GIF, 5 MB max).
- Persistent storage support via `UPLOAD_DIR` env or default `public/uploads/` (Coolify volume mount ready).
- Restaurant `logoUrl`, `city`, and `country` fields with Settings UI (logo dropzone + location inputs).
- `MenuItem.images` string array (max 3) replacing single `imageUrl`; multi-image dropzone in Menu Manager.
- Public menu dish image carousel with touch scroll and dot pagination.
- Restaurant logo and location in public menu header.
- Global public directory at `/restaurants` listing all active venues with logo, location, and View Menu CTA.
- Landing nav/footer link to Restaurant Directory.

### Changed

- Seed data uses location metadata; external Unsplash image URLs removed from seed items.

### Migration

- Run `npm run db:migrate:deploy` on production after deploy.
- Mount a persistent volume to `public/uploads` (or set `UPLOAD_DIR`) so uploads survive redeploys.

---

## [0.4.0] - 2026-06-22

### Added

- Dynamic JSON translation fields on `Menu` and `MenuItem` (`name`, `description`) replacing hardcoded bilingual columns.
- `Restaurant.languages` array for tenant-configurable menu languages (EN, TH, FA, AR, RU).
- `Restaurant.uiLanguage` for dashboard UI locale (renamed from `language`).
- Expanded operational currencies: USD, THB, IRT (Toman), SAR (Rial), RUB (Ruble) with locale-aware formatting.
- UI dictionaries for Persian (`fa.json`), Arabic (`ar.json`), and Russian (`ru.json`).
- Multi-select **Supported Menu Languages** and expanded currency dropdown in tenant Settings.
- Dynamic per-language inputs in Menu Manager driven by tenant language configuration.
- Public menu reads `NEXT_LOCALE` cookie and resolves JSON translations with English fallback.
- RTL layout support for Arabic and Persian; Noto Sans Arabic font.

### Changed

- `LanguageSwitcher` supports five global locales; public menu shows only tenant-enabled languages.

### Migration

- Run `npm run db:migrate:deploy` on production after deploy.
- Existing bilingual data is migrated automatically into JSON objects (`en` + `th` keys).

---

## [0.3.0] - 2026-06-23

### Changed

- Full platform rebrand from MenuHub to **ReviewBite** (`reviewbite.co`).
- ReviewBite design system: `amber-500` signature CTAs, `slate-950` dark surfaces, emerald/rose metric cues.
- Landing page rebuilt with tagline *"Turn Every Table Into a 5-Star Review."* and updated hero copy.
- Resend email template rebranded to ReviewBite with subject *"How was your experience at [Restaurant] yesterday?"*
- Noto Sans Thai font for clean loopless Thai typography when `NEXT_LOCALE=th`.
- Public menu: amber category pills and pricing, image placeholders when `imageUrl` is missing.
- Primary buttons app-wide use amber accent; admin nav uses `slate-950`.

---

## [0.2.1] - 2026-06-23

### Fixed

- Cron auth fail-closed when `CRON_SECRET` is missing; timing-safe bearer comparison.
- Atomic cron email claim prevents duplicate sends under concurrent runs; reverts claim on send failure.
- Cron skips inactive restaurants; production default follow-up window restored to 23–25 hours (1380–1500 minutes).
- Unique constraint on `(restaurantId, email)` with upsert in Wi-Fi unlock API.
- Feedback API enforces `isActive`, 2000-character comment limit.
- Review page enforces `isActive`, i18n wired, positive path thank-you when Google URL missing.
- Deactivated tenants see account-suspended message instead of full dashboard.
- Production seed skips wipe when data exists unless `SEED_FORCE=true`.
- CSV export neutralizes formula injection; non-superadmin export returns 403.
- Client-controlled `source` field removed from Wi-Fi unlock (server sets `WIFI_UNLOCK`).

### Migrations

- `20250623120000_unique_lead_email_per_restaurant` — dedupe leads and add unique index.

---

## [0.2.0] - 2026-06-23

### Added

- Super-admin **Customer Emails** page at `/admin/leads` with guest email table and **Export CSV** download.
- Super-admin **Restaurant Registry** at `/admin/restaurants` with activate, deactivate, and permanent delete.
- `Restaurant.isActive` flag — deactivated venues hide public menu and block Wi-Fi capture.
- Tenant **Private Feedback** page at `/dashboard/feedback` — each restaurant sees only its own guest complaints.
- Shared `FeedbackList` component for consistent feedback table rendering.
- Live **Resend** email delivery with mobile-responsive HTML review template (Loved it / Could be better buttons).
- Configurable review follow-up window via `REVIEW_EMAIL_MIN_AGE_MINUTES` and `REVIEW_EMAIL_MAX_AGE_MINUTES` env vars.
- Cookie-based bilingual i18n (`NEXT_LOCALE` cookie) with English and Thai dictionaries.
- `LanguageSwitcher` floating flag toggle with instant server re-render.
- `LocaleProvider`, `getDictionary()`, and typed dictionary helpers.
- Bilingual menu schema: `nameEn`/`nameTh`, `descriptionEn`/`descriptionTh` on menus and items.
- Wi-Fi gate **Skip & View Menu** bypass with locked Wi-Fi banner and re-open link.
- Restaurant **currency** and **language** settings (USD, THB, EUR, GBP / English, Thai).
- Dynamic price formatting based on restaurant currency and guest locale.
- Responsive menu item images with loading skeleton and broken-image fallback.
- Cursor rule to always push completed work to origin (`.cursor/rules/git-push.mdc`).
- Deep code review document at `docs/CODE_REVIEW.md`.

### Changed

- Product README rewritten as a non-technical feature guide for owners, guests, and operators.
- Private guest feedback moved from super-admin to each tenant dashboard.
- Super-admin sidebar: Overview, Restaurants, Customer Emails (feedback monitor removed from admin).
- `/admin/feedback` redirects to `/admin` overview.
- Review follow-up cron window temporarily set to **50–70 minutes** for testing (production target: 23–25 hours / 1380–1500 minutes via env).
- Upgraded Resend SDK from v4 to v6.
- Cron review job isolates per-lead send failures; marks leads emailed only after successful delivery.
- Wi-Fi unlock API skips duplicate lead creation for returning guest emails while still returning credentials.
- Refactored admin and tenant dashboard layouts: rigid `flex h-screen` shell, `w-64` sidebar, independent main scroll.
- Rebuilt admin and tenant sidebars with Lucide icons, slate active states, and mobile overlay drawers (removed bottom nav).
- Standardized admin data tables with overflow-safe wrappers and consistent row spacing.
- Admin overview metrics grid (`sm:grid-cols-2 lg:grid-cols-4`) with explicit color tokens.
- Feedback rating badges: emerald (4–5), amber (3), rose (1–2).
- Reconstructed tenant `SettingsForm` into section cards with responsive field grids.
- Polished `MenuQrCode` with centered preview and download button.
- Docker build hardened for low-resource Coolify hosts: webpack build, BuildKit caches, separate prod-deps stage, fewer runner layers.
- `.dockerignore` expanded to exclude `.cursor`, assets, and image files from build context.

### Fixed

- Duplicate Wi-Fi lead rows when same guest email submits twice (application-level dedup before create).
- `SettingsForm` missing `cn` import (pre-i18n build failure).
- i18n split: client-safe `i18n.ts` vs server-only `i18n-server.ts` to prevent `next/headers` in client bundle.

### Security

- Documented known gaps in `docs/CODE_REVIEW.md` (cron secret fail-open, Wi-Fi IDOR, feedback spam, cron race, seed wipe risk).

### Migrations

- `20250622120000_add_restaurant_locale` — `currency`, `language` on Restaurant.
- `20250622140000_bilingual_menu_fields` — bilingual menu columns.
- `20250623000000_add_restaurant_is_active` — `isActive` on Restaurant.

---

## [0.1.0] - 2025-06-22

### Added

- Initial MenuHub platform on Next.js App Router with TypeScript and Tailwind CSS.
- Database models: User, Restaurant, Menu, MenuItem, CustomerLead, Feedback.
- Roles: `SUPERADMIN` (platform operator) and `TENANT` (restaurant owner).
- Public menu page at `/menu/[slug]` with Wi-Fi gate overlay and lead capture.
- Wi-Fi unlock endpoint: email validation, lead save, credential response.
- Smart review router at `/review/[leadId]`: Google redirect for happy guests, private form for unhappy.
- Review cron endpoint with 23–25 hour lead window and bearer token protection.
- Feedback submission endpoint for internal negative reviews.
- Credentials authentication with JWT sessions and role in token.
- Tenant self-registration: creates user + restaurant with auto-generated slug.
- Tenant dashboard: overview metrics, menu management, settings with QR code.
- Super admin dashboard: platform overview, restaurant registry, global feedback monitor.
- Middleware role guards for `/dashboard/*` and `/admin/*`.
- Database seed: Green Bistro Coffee sample tenant + super admin user.
- Manual SQL seed fallback for container PostgreSQL console.
- Initial database migration.
- Multi-stage production Docker image with standalone output.
- Marketing landing page: hero, how-it-works, features, pricing, footer.
- Shared UI primitives: Button, Input, Textarea, Badge, Card, FormAlert.
- `PublicMenuExperience` client wrapper for post-Wi-Fi menu unlock.
- Sticky horizontal category navigation with scroll spy on public menu.
- Mobile-responsive tenant and super admin navigation.
- QR code download component for tenant settings (Print Station).
- `CHANGELOG.md` and project documentation.

### Changed

- Replaced default Next.js homepage with MenuHub marketing landing page.
- Global UI refactor: slate/zinc design system, micro-shadows, smooth transitions.
- Wi-Fi gate: frosted-glass overlay, iOS-style credential card, copy animation.
- Menu list: card grid with fade-in animations and availability badges.
- Auth pages: gradient backgrounds, icon inputs, fixed-height error alerts.
- Metric cards: icon placeholders and uniform height.
- Super admin zone: indigo accent to distinguish from tenant dashboard.
- Admin tables: hover rows, star rating badges, improved columns.
- Review feedback form: interactive star buttons, mobile-friendly textarea.
- Docker runner stage includes database migrate/seed tooling.
- Root layout metadata updated to MenuHub branding.
- Global CSS: premium light theme, fade-in animation, Geist font stack.

### Fixed

- Database client initialization with PostgreSQL driver adapter.
- Auth session types extended with userId, restaurantId, and role.
- Sign-out action isolated to prevent database client in client bundle.
- Super admin redirected from tenant dashboard; tenants blocked from admin.
- Menu blur clears after successful Wi-Fi unlock.
- Production container seed/migrate tooling (`tsx`, `prisma` not found) — Docker fix + manual SQL documented.

---

[Unreleased]: https://github.com/majidorc/resturant/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/majidorc/resturant/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/majidorc/resturant/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/majidorc/resturant/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/majidorc/resturant/releases/tag/v0.1.0
