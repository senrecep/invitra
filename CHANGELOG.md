# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-05-07

### Added
- PWA support: `manifest.json`, 9 icon sizes (72–512px), service worker via `@ducanh2912/next-pwa`
- Brand assets: `icon.png` (512px), `apple-icon.png` (180px), OG/Twitter images (1200×630)
- Banner image in README

### Changed
- Complete color redesign: replaced violet/purple palette with slate-800 + rose-600 warm neutral system
- App icon: replaced inline SVG with `icon.png` in header, login, and invite pages
- OG image dimensions corrected to standard 1200×630

### Fixed
- SettingsPanel form inputs empty on load — added `useEffect` to sync state when settings loads asynchronously

## [1.0.0] - 2026-05-06

### Added

#### Core System
- Next.js 15 App Router with custom Socket.io server for real-time sync
- PostgreSQL + Prisma 6 ORM with full schema (Guests, Groups, Organizers, EventSettings)
- Role-based access: admin (full control) and organizer (own guests only)
- Session-based authentication with bcrypt password hashing and httpOnly cookies
- Real-time broadcast — all mutations instantly push to every connected client via Socket.io

#### Guest Management
- Add, edit, delete guests with full name, potential/confirmed counts, group, organizer, transportation
- Transportation types: OWN_CAR, PUBLIC_TRANSPORT, REQUESTING_VEHICLE
- Confirmed count capped at potential count (validation both UI and API)
- 4 view modes: All, By Group, By Organizer, By Date

#### Dashboard & Statistics
- Summary panel: total guests, total potential, total confirmed
- Capacity usage bar with color indicator (green/amber/red)
- Breakdown by group, by organizer, by transportation type
- Event info banner (name, description, date, time)

#### Settings Panel
- Event info configuration: name, description, date, time, locale, timezone
- Capacity limit configuration
- Editing toggle — disable/enable all mutations system-wide, synced live to all clients
- Group management: add, edit, delete, copy invite link
- Organizer management: add, edit, delete, copy invite link

#### Internationalization
- Turkish UI via next-intl
- Locale and timezone stored in DB (not env vars) — configurable per event
- `Intl.DateTimeFormat` / `Intl.RelativeTimeFormat` for locale-aware date display

#### Security & Privacy
- Full crawler blocking: `X-Robots-Tag` headers + `robots.txt` blocking all bots
- No search engine or AI crawler indexing

#### Infrastructure
- Docker Compose for local development (app + PostgreSQL)
- Separate `docker-compose.dokploy.yml` for production (no exposed ports, external network, resource limits)
- PWA-ready: `next-pwa` service worker, Web App Manifest, Apple touch icon
- Mobile-first design, tested for 10–20 concurrent users
