# Invitra — Event Guest Management System

![Invitra](public/banner.png)

A real-time, multi-user guest management system for weddings and events. Built mobile-first for 10–20 concurrent users. Self-hosted via Docker Compose with Traefik/Dokploy support.

---

## Features

- **Real-time sync** — Socket.io broadcasts all changes instantly to every connected client
- **Role-based access**
  - **Admin** — full access: manage settings, groups, organizers, all guests
  - **Organizer** — accesses via unique invite link, can only manage their own guests
- **Guest management** — name, potential/confirmed headcount, transportation type, group, organizer
- **Transportation tracking** — Own Car / Public Transport / Requesting Vehicle
- **Dashboard** — live stats: total guests, potential & confirmed headcount, capacity bar, breakdown by group, organizer, and transportation type
- **Multiple list views** — All, By Group, By Organizer, By Date (all collapsible sections)
- **Event info** — name, description, date, time displayed in the dashboard header
- **Editing toggle** — admin can lock/unlock editing for organizers globally; amber banner shown to all clients in real time
- **Audit log** — every create/update/delete action is recorded with actor and diff
- **i18n** — Turkish (default) and English, cookie-based locale switching
- **Mobile-first UI** — Tailwind CSS v4, violet/orange brand palette, touch-friendly (44px targets)
- **No indexing** — `robots.txt` + `X-Robots-Tag` headers block all search engines and AI crawlers

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) + custom server |
| Realtime | Socket.io |
| Database | PostgreSQL 16 |
| ORM | Prisma 6 |
| Styling | Tailwind CSS v4 |
| Auth | bcrypt password hash → JWT cookie |
| i18n | next-intl |
| Deploy | Docker Compose + Traefik (Dokploy) |

---

## Environment Variables

### `.env` — Docker Compose & production

```env
# Database — connects to the db service inside Docker
DATABASE_URL=postgresql://invitra:invitra123@db:5432/invitra

# JWT secret — change to a secure random string in production
JWT_SECRET=your-secret-here

# PostgreSQL password used by the db service
POSTGRES_PASSWORD=your-db-password

# Traefik domain
DOMAIN=invitra.yourdomain.com
```

### `secrets.env` — sensitive secrets (Docker only)

> Dollar signs in bcrypt hashes must be doubled (`$$`) for Docker Compose `env_file` interpolation.

```env
MASTER_PASSWORD_HASH=$$2b$$12$$your_bcrypt_hash_here
```

Generate a hash:
```bash
node -e "const b = require('bcryptjs'); b.hash('yourpassword', 12).then(h => console.log(h))"
```
Then replace every `$` with `$$` in the output.

### `.env.local` — local development only (Next.js)

> Dollar signs must be escaped with `\$` for dotenv-expand.

```env
MASTER_PASSWORD_HASH=\$2b\$12\$your_bcrypt_hash_here
DATABASE_URL=postgresql://invitra:invitra123@localhost:5432/invitra
JWT_SECRET=your-local-secret
```

---

## Local Development

### Prerequisites

- Node.js 20+
- PostgreSQL 16 running locally (or via Docker)
- npm

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local (see Environment Variables above)

# 3. Push database schema
DATABASE_URL=postgresql://invitra:invitra123@localhost:5432/invitra npx prisma db push

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with your master password.

### Start PostgreSQL with Docker (local only)

```bash
docker run -d \
  --name invitra-db \
  -e POSTGRES_USER=invitra \
  -e POSTGRES_PASSWORD=invitra123 \
  -e POSTGRES_DB=invitra \
  -p 5432:5432 \
  postgres:16-alpine
```

---

## Docker Compose / Dokploy Deployment

### File Overview

| File | Purpose |
|------|---------|
| `.env` | Non-secret variables + Docker Compose YAML substitution |
| `secrets.env` | Sensitive secrets loaded into the container via `env_file` |
| `docker-compose.yml` | App + PostgreSQL services with Traefik labels |

### Deploy with Docker Compose

```bash
# 1. Create .env and secrets.env (see above)

# 2. Build and start
docker compose up -d --build

# 3. Check logs
docker compose logs -f app
```

### Dokploy Setup

1. Create a new **Docker Compose** application in Dokploy
2. Point it to this repository
3. Set the following environment variables in Dokploy's environment manager:

| Variable | Description |
|----------|-------------|
| `POSTGRES_PASSWORD` | PostgreSQL database password |
| `JWT_SECRET` | Secure random string for JWT signing |
| `DOMAIN` | Your domain (e.g. `invitra.example.com`) |
| `MASTER_PASSWORD_HASH` | bcrypt hash — set in `secrets.env` with `$$` escaping |

4. Traefik labels in `docker-compose.yml` handle HTTPS automatically via Let's Encrypt.

---

## Admin Panel Settings

All settings are configured via the admin panel at `/app` — no restart required, changes apply in real time:

| Setting | Description |
|---------|-------------|
| **Event Name** | Displayed in the dashboard header |
| **Description** | Subtitle shown under the event name |
| **Date / Time** | Event date and time |
| **Locale** | Date/time formatting locale (e.g. `tr-TR`, `en-US`) |
| **Timezone** | Timezone for date display (e.g. `Europe/Istanbul`) |
| **Capacity** | Total guest capacity — shown in the dashboard progress bar |
| **Editing Toggle** | Lock/unlock guest editing for all organizers globally |
| **Groups** | Create/edit/delete guest groups with shareable links |
| **Organizers** | Create/edit/delete organizer accounts with unique invite links |

---

## Organizer Invite Flow

1. Admin creates an organizer in the settings panel
2. Copy the share link: `/invite/[token]`
3. Organizer opens the link — automatically authenticated
4. Organizer can add/edit/delete only their own guests (when editing is enabled)

---

## Project Structure

```
src/
  app/
    api/              # REST API routes (auth, guests, groups, organizers, settings, audit)
    app/              # Main authenticated app page
    login/            # Admin login page
    invite/[token]/   # Organizer invite landing
  components/         # UI components (GuestCard, GuestList, Dashboard, SettingsPanel, AddGuestModal)
  contexts/           # AppContext — Socket.io connection, shared state
  lib/                # prisma client, auth helpers, socket emit, locale utilities
  proxy.ts            # Next.js middleware — auth guard for protected routes
messages/
  tr.json             # Turkish translations (default)
  en.json             # English translations
prisma/
  schema.prisma       # Database schema
public/
  robots.txt          # Blocks all search engine and AI crawler indexing
```
