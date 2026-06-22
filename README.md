# MenuHub

Premium multi-tenant SaaS platform for restaurants: digital QR menus, Wi-Fi lead capture, automated review follow-ups, and smart Google review routing.

Built with Next.js (App Router), TypeScript, Tailwind CSS, Prisma ORM, PostgreSQL, and NextAuth.js. Production deployments use a Docker standalone build optimized for Coolify.

---

## Functional Architecture

| Surface | Route(s) | Description |
|---------|----------|-------------|
| **Marketing Landing Page** | `/` | Conversion-focused homepage with features, pricing, and signup CTAs |
| **Authentication** | `/login`, `/register` | Credentials-based auth for tenants and super admins |
| **Public Menu & Wi-Fi Gate** | `/menu/[slug]` | Mobile-first menu with email-gated Wi-Fi unlock and lead capture |
| **Smart Review Router** | `/review/[leadId]` | Routes satisfied guests to Google Reviews; unhappy guests to private feedback |
| **Tenant Dashboard** | `/dashboard/*` | Restaurant owners manage menus, settings, metrics, and QR codes |
| **Super Admin Dashboard** | `/admin/*` | Platform-wide analytics, restaurant registry, and global feedback monitor |
| **Cron Job Runner** | `GET/POST /api/cron/send-reviews` | Sends 24-hour review follow-up emails (protected by `CRON_SECRET`) |

### Core Automation Loop

1. Guest scans QR code → opens public menu.
2. Wi-Fi overlay collects email → saves `CustomerLead` → returns Wi-Fi credentials.
3. After ~24 hours, cron job emails review request with satisfied/dissatisfied links.
4. Satisfied clicks → redirect to Google Review URL. Dissatisfied → internal `Feedback` form.

### Roles

- **`TENANT`** — Restaurant owner linked to one `Restaurant` record.
- **`SUPERADMIN`** — Platform administrator with access to `/admin/*` only.

Middleware enforces role isolation: tenants cannot access admin routes; super admins are redirected away from tenant dashboard routes.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS 4, Lucide React icons
- **Database:** PostgreSQL via Prisma ORM 7 (`@prisma/adapter-pg`)
- **Auth:** NextAuth.js v5 (JWT sessions, Credentials provider, bcrypt password hashing)
- **QR Codes:** `qrcode.react`
- **Deployment:** Multi-stage Docker image with `output: "standalone"`

---

## Local Development Setup

### Prerequisites

- Node.js 20+
- PostgreSQL database
- npm

### 1. Clone and install

```bash
git clone https://github.com/majidorc/resturant.git
cd resturant
npm install
```

### 2. Environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXT_PUBLIC_APP_URL` | Yes | Public app URL (e.g. `http://localhost:3000`) |
| `NEXTAUTH_URL` | Yes | Same as public URL in dev; production domain in prod |
| `NEXTAUTH_SECRET` | Yes | Random 32+ byte string (`openssl rand -base64 32`) |
| `AUTH_TRUST_HOST` | Yes (prod) | Set `true` behind Coolify/reverse proxy |
| `CRON_SECRET` | Yes | Bearer token for `/api/cron/send-reviews` |
| `RESEND_API_KEY` | No | Email provider key (cron currently logs to console) |
| `EMAIL_FROM` | No | Sender address for review emails |

### 3. Database setup

```bash
# Apply migrations
npm run db:migrate

# Or push schema without migration history (dev only)
npm run db:push

# Seed sample tenant + super admin (WARNING: wipes existing data)
npm run db:seed
```

**Seed credentials:**

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `admin@menuhub.com` | `admin1234` |
| Tenant | `bistro_owner@greenbistro.com` | `bistro1234` |

**Manual seed (if container seed fails):** run SQL from `prisma/seed-manual.sql` in your PostgreSQL console.

### 4. Start dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Generate Prisma client + production build |
| `npm run start` | Start production server (non-Docker) |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:migrate` | Create/apply dev migrations |
| `npm run db:migrate:deploy` | Apply migrations in production |
| `npm run db:push` | Push schema to DB (dev shortcut) |
| `npm run db:seed` | Run seed script |
| `npm run db:studio` | Open Prisma Studio |

---

## Production Build (Docker / Coolify)

### Standalone output

`next.config.ts` enables standalone mode for minimal container images:

```typescript
const nextConfig = {
  output: "standalone",
};
```

### Build locally

```bash
npm run build
node .next/standalone/server.js
```

### Docker

```bash
docker build -t menuhub .
docker run -p 3000:3000 --env-file .env menuhub
```

The `Dockerfile` uses a four-stage build (`deps` → `prod-deps` → `builder` → `runner`):

1. `npm ci` for full dependencies (builder)
2. `npm install --omit=dev` for Prisma migrate/seed tooling only (runner merge)
3. `prisma generate` + `next build --webpack` (webpack is more stable than Turbopack on low-CPU Coolify hosts)
4. Copies `.next/standalone`, static assets, Prisma schema, and DB tooling into the runner image

Container starts with `node server.js` on port `3000` (`HOSTNAME=0.0.0.0`).

### Coolify build failures (exit 255 at “exporting layers”)

If the build log shows **Compiled successfully** but fails at **exporting to image**, the app code is fine — the host ran out of time, disk, or memory while saving the image.

1. **Free disk space** on the Coolify server (`docker system prune -af` if safe).
2. **Increase build timeout** in Coolify (Settings → Advanced) — first builds can take 15–25+ minutes on 1 vCPU.
3. **Redeploy** after this repo’s Dockerfile optimizations (webpack build, fewer runner layers, npm cache mounts).

### Coolify deployment checklist

1. Set all environment variables from `.env.example` (use your production domain for `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL`).
2. Set `AUTH_TRUST_HOST=true`.
3. Deploy from the root `Dockerfile`.
4. Expose port **3000**.
5. Run migrations once in the container terminal:

   ```bash
   npm run db:migrate:deploy
   ```

6. Seed database (first deploy only):

   ```bash
   npm run db:seed
   ```

   Or paste `prisma/seed-manual.sql` into the PostgreSQL service console.

7. Schedule cron for review emails (hourly recommended):

   ```http
   GET https://your-domain.com/api/cron/send-reviews
   Authorization: Bearer YOUR_CRON_SECRET
   ```

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Marketing landing page
│   ├── (auth)/                     # Login & register
│   ├── (dashboard)/dashboard/      # Tenant dashboard
│   ├── admin/                      # Super admin dashboard
│   ├── menu/[slug]/                # Public menu + Wi-Fi gate
│   ├── review/[leadId]/            # Smart review router
│   └── api/                        # REST endpoints + NextAuth + cron
├── components/
│   ├── landing/                    # Homepage sections
│   ├── dashboard/                  # Tenant UI components
│   ├── admin/                      # Admin UI components
│   └── ui/                         # Shared design system primitives
├── lib/
│   ├── auth.ts                     # NextAuth configuration
│   ├── prisma.ts                   # Prisma client singleton
│   └── actions/                    # Server actions
└── middleware.ts                   # Auth + role-based route guards
prisma/
├── schema.prisma                   # Database models
├── seed.ts                         # Dev/prod seed script
├── seed-manual.sql                 # Manual SQL seed fallback
└── migrations/                     # Migration history
```

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/lead/unlock-wifi` | Public | Save lead, return Wi-Fi credentials |
| `POST` | `/api/feedback` | Public | Save internal negative feedback |
| `GET/POST` | `/api/cron/send-reviews` | `Bearer CRON_SECRET` | 24-hour review email job |
| `GET/POST` | `/api/auth/*` | NextAuth | Session management |

---

## License

Private project. All rights reserved.
