# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### Added

- Cookie-based bilingual i18n (`NEXT_LOCALE` cookie) with `en` and `th` dictionaries under `src/dictionaries/`.
- `LanguageSwitcher` floating flag toggle (🇺🇸 EN / 🇹🇭 TH) with `router.refresh()` for instant server re-render.
- `LocaleProvider`, `getDictionary()`, and typed `Dictionary` helpers for server and client localization.
- Bilingual `Menu` and `MenuItem` schema fields (`nameEn`/`nameTh`, `descriptionEn`/`descriptionTh`).
- Prisma migration `20250622140000_bilingual_menu_fields`.
- Wi-Fi gate "Skip & View Menu" bypass with locked Wi-Fi banner and re-open trigger on the public menu.
- `currency` and `language` fields on `Restaurant` model with tenant settings dropdowns (USD, THB, EUR, GBP / English, Thai).
- `src/lib/locale.ts` utility for validated currency and language options plus dynamic price formatting.
- Responsive menu item image rendering with loading skeleton and broken-image fallback in `MenuList`.
- Prisma migration `20250622120000_add_restaurant_locale`.

### Changed

- Private guest feedback now lives on each tenant dashboard at `/dashboard/feedback` instead of super-admin routes.
- Removed super-admin Restaurants and Feedback pages; old URLs redirect to `/admin`.
- Review follow-up cron window temporarily set to **50–70 minutes** (~1 hour) for testing; override via `REVIEW_EMAIL_MIN_AGE_MINUTES` / `REVIEW_EMAIL_MAX_AGE_MINUTES` (production target was 23–25 hours).
- Replaced mock mailer with live Resend SDK delivery and a mobile-responsive HTML review template.
- Cron review job now isolates per-lead send failures and only marks leads as emailed after successful delivery.
- Wi-Fi locked banner uses inline reopen link copy aligned with skip-gate UX.
- `MenuManager` and menu server actions now capture and persist English and Thai menu content.
- `MenuList` renders localized menu copy from cookie locale with dynamic currency formatting.
- Wi-Fi unlock API skips duplicate `CustomerLead` creation when email is already registered for the same restaurant while still returning credentials.
- Refactored `/admin` layout shell to a rigid `flex h-screen` structure with independent main content scrolling and `w-64 shrink-0` desktop sidebar.
- Rebuilt `AdminSidebar` with slate-based active states, Lucide icons, and a mobile overlay drawer (removed bottom nav that caused layout shift).
- Standardized admin data tables with overflow-safe wrappers, uppercase slate headers, and consistent `px-6 py-4` row spacing.
- Re-architected admin overview metrics grid (`sm:grid-cols-2 lg:grid-cols-4`) with explicit Tailwind color tokens.
- Updated feedback rating badges to emerald (4–5), amber (3), and rose (1–2) tones.
- Refactored tenant `/dashboard` layout shell to match admin flex structure with independent scrolling main viewport.
- Rebuilt `DashboardSidebar` with Lucide icons, slate active states, and mobile overlay drawer (removed bottom nav).
- Reconstructed `SettingsForm` into section cards with responsive `md:grid-cols-2` field grids, focus rings, and loading spinner on save.
- Polished `MenuQrCode` with centered preview card, clipboard-style link utility, and responsive download button.

---

## [0.1.0] - 2025-06-22

### Added

- Initial Next.js 16 App Router project with TypeScript and Tailwind CSS 4.
- Prisma 7 schema: `User`, `Restaurant`, `Menu`, `MenuItem`, `CustomerLead`, `Feedback` with `SUPERADMIN` / `TENANT` roles.
- Prisma client singleton with `@prisma/adapter-pg` for PostgreSQL.
- Public menu page at `/menu/[slug]` with blurred menu preview and Wi-Fi gate overlay.
- Wi-Fi unlock API at `POST /api/lead/unlock-wifi` (email validation, lead capture, credential response).
- Smart review router at `/review/[leadId]` with Google redirect and internal feedback form.
- Review cron endpoint at `/api/cron/send-reviews` (23–25 hour lead window, `CRON_SECRET` protection).
- Feedback API at `POST /api/feedback`.
- NextAuth.js v5 credentials authentication with JWT sessions and role in session token.
- Tenant registration server action (creates user + restaurant with auto slug).
- Tenant dashboard: overview metrics, menu management, settings with QR code generator.
- Super admin dashboard at `/admin` with platform overview, restaurant registry, and global feedback monitor.
- Middleware role guards for `/dashboard/*` and `/admin/*` routes.
- Database seed script (`prisma/seed.ts`) with Green Bistro Coffee sample tenant and super admin user.
- Manual SQL seed fallback (`prisma/seed-manual.sql`) for Coolify PostgreSQL console.
- Initial Prisma migration (`20250622000000_init`).
- Multi-stage production `Dockerfile` with Next.js `output: "standalone"`.
- `.dockerignore` and `.env.example` for deployment configuration.
- Marketing landing page at `/` with hero, how-it-works, features, pricing, and footer sections.
- `lucide-react` icon integration across landing and dashboard surfaces.
- Shared UI primitives: `Button`, `Input`, `Textarea`, `Badge`, `Card`, `FormAlert`.
- `PublicMenuExperience` client wrapper to unlock menu after Wi-Fi submission.
- Sticky horizontal category navigation with scroll spy on public menu.
- Mobile-responsive tenant and super admin navigation (drawer + bottom bar).
- QR code download component for tenant settings ("Print Station").
- `CHANGELOG.md` and comprehensive `README.md` project documentation.

### Changed

- Replaced default Next.js skeleton homepage with premium MenuHub marketing landing page.
- Global UI refactor: slate/zinc design system, micro-shadows, `transition-all duration-200` interactions.
- Wi-Fi gate upgraded to frosted-glass overlay with iOS-style credential card and copy success animation.
- Menu list redesigned as card grid with fade-in animations and availability badges.
- Auth pages updated with gradient backgrounds, icon inputs, and fixed-height error alerts.
- Metric cards redesigned with icon placeholders and uniform height alignment.
- Super admin zone styled with indigo accent to distinguish from tenant dashboard.
- Admin tables enhanced with hover rows, star rating badges, and improved column layout.
- Review feedback form upgraded with interactive star buttons and mobile-friendly textarea.
- `db:seed` script updated to invoke `tsx` via explicit Node path for container compatibility.
- Docker runner stage copies `tsx` and Prisma tooling for in-container migrate/seed operations.
- Root layout metadata updated to MenuHub branding.
- `globals.css` updated with premium light theme, fade-in animation, and Geist font stack.

### Fixed

- Prisma 7 client initialization requiring explicit PostgreSQL driver adapter.
- NextAuth session types extended with `userId`, `restaurantId`, and `role` fields.
- Sign-out button server action isolated to prevent Prisma bundling into client components.
- Super admin users redirected away from tenant dashboard; tenants blocked from `/admin`.
- Menu blur state now clears after successful Wi-Fi unlock.
- Production container `prisma: not found` and `tsx: not found` errors during seed (Docker tooling + manual SQL fallback documented).

[Unreleased]: https://github.com/majidorc/resturant/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/majidorc/resturant/releases/tag/v0.1.0
