# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

_No unreleased changes._

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

[Unreleased]: https://github.com/majidorc/resturant/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/majidorc/resturant/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/majidorc/resturant/releases/tag/v0.1.0
