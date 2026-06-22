# MenuHub

Turn every table scan into a guest email, a Wi-Fi unlock, and a Google review — without awkward asks at the counter.

MenuHub is a restaurant marketing system. Each venue gets its own digital menu, Wi-Fi lead capture, automated follow-up emails, and smart routing that sends happy guests to Google and unhappy guests to private feedback.

**Live demo:** [qrmenu.majidorc.com](https://qrmenu.majidorc.com)

---

## Who Uses MenuHub

### Restaurant owner (tenant)

Runs one restaurant. Signs up, builds a menu, prints a QR code, and watches leads and feedback roll in from a private dashboard.

### Platform operator (super admin)

Runs the whole MenuHub installation. Sees platform-wide stats, exports all guest emails, and can activate, deactivate, or remove restaurants.

### Guest (no account)

Scans a QR code on the table, views the menu, optionally unlocks Wi-Fi with an email, and may receive a follow-up email asking how the visit went.

---

## The Guest Journey

1. **Scan** — Guest scans the QR code on the table or counter.
2. **Menu** — They see a mobile-friendly digital menu with photos, prices, and categories in English or Thai.
3. **Wi-Fi gate** — To get the Wi-Fi password, they enter their email. They can also skip and browse the menu without Wi-Fi.
4. **Follow-up email** — Hours later, MenuHub sends a friendly email: “How was your visit?”
5. **Smart routing**
   - **Loved it** → Guest is sent to the restaurant’s Google Review page.
   - **Could be better** → Guest fills a private feedback form. Only the restaurant owner sees it — never posted publicly.

---

## Restaurant Owner Dashboard

After logging in, the owner manages everything from one place.

### Overview

- Total guest emails captured
- Review email conversion rate
- Count of private feedback submissions
- Recent leads list

### Menu Manager

- Create menu categories (English + Thai names)
- Add dishes with descriptions, prices, and photos
- Show or hide categories and items on the public menu

### Private Feedback

- Read every “could be better” submission from guests
- Star ratings and written comments
- Sorted newest first — only for this restaurant

### Settings

- **Restaurant profile** — Name and public menu link
- **Wi-Fi credentials** — Network name and password shown after email capture
- **Google Review link** — Where happy guests go from the follow-up email
- **Currency & language** — USD, THB, EUR, GBP and English or Thai defaults
- **Print Station** — Download a QR code for table tents and signage

---

## Super Admin Console

Platform-wide control for the MenuHub operator.

### Global Overview

- Total registered restaurants
- Total platform users
- Total guest emails collected across all venues
- Total private feedback submissions
- Top restaurants by lead volume

### Restaurant Registry

- List every tenant with owner email, lead count, and status
- **Activate** — Restaurant is live; public menu and Wi-Fi work
- **Deactivate** — Public menu goes offline; Wi-Fi capture stops; owner dashboard still accessible
- **Delete** — Permanently removes the restaurant, all menus, leads, feedback, and the owner account

### Customer Emails

- Searchable table of all guest emails platform-wide
- Shows restaurant, capture source, review email status, and date
- **Export CSV** — Download all emails for marketing or CRM import

---

## Public Marketing Site

The homepage at `/` explains the product to new restaurant owners:

- Hero and value proposition
- How it works (scan → email → review)
- Feature highlights
- Pricing section
- Sign up and log in links

---

## Languages

Guests and owners can switch between **English** and **Thai** using the flag toggle. Menu content supports both languages per item. Prices format correctly for the restaurant’s chosen currency.

---

## What Happens When a Restaurant Is Deactivated

| Feature | Active | Deactivated |
|---------|--------|-------------|
| Public menu (`/menu/slug`) | Visible | Hidden (404) |
| Wi-Fi email capture | Works | Blocked |
| Follow-up review emails | Sent | Should stop (see code review notes) |
| Owner dashboard | Full access | Full access |
| Google review routing | Works | Review links may still work for old emails |

---

## Accounts & Access

| Role | Can access | Cannot access |
|------|------------|---------------|
| Restaurant owner | Own dashboard, menu, settings, feedback | Other restaurants, super admin |
| Super admin | Platform overview, all emails export, restaurant registry | Individual tenant dashboards |
| Guest | Public menu, Wi-Fi gate, review forms | Any logged-in area |

New restaurants can self-register from the homepage. Each registration creates one owner account linked to one restaurant.

---

## Automation Summary

| Trigger | Action |
|---------|--------|
| Guest submits email on Wi-Fi gate | Email saved as a lead; Wi-Fi password shown |
| Same guest email returns | No duplicate lead; Wi-Fi still shown |
| Scheduled job runs (cron) | Review follow-up emails sent to eligible leads |
| Guest clicks “Loved it” in email | Redirect to Google Reviews |
| Guest clicks “Could be better” | Private feedback form for that restaurant |
| Owner submits feedback form | Stored in tenant dashboard only |

---

## Documentation

- **[CHANGELOG.md](./CHANGELOG.md)** — Full version history
- **[docs/CODE_REVIEW.md](./docs/CODE_REVIEW.md)** — Deep security and quality audit (2026-06-23)

---

## License

Private project. All rights reserved.
