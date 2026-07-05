# ZeroVoice — AI Voice Platform

Voice AI platform built with Laravel 13 + React 19 + Inertia 3.

## Features

- **Dashboard** — Tenant-scoped metrics (total/active flows, calls, avg duration)
- **Flows CRUD** — Voice flow builder with configurable steps (say, gather, hangup, transfer)
- **Call Logs** — Searchable call history with status filters, transcript viewer, error details
- **API Tokens** — Sanctum-based token management with read/write/delete abilities
- **Team Management** — Role-based access (owner/admin/member), email invitations with token
- **Tenant Settings** — Per-tenant configuration (name, slug, timezone, language)
- **Landing Page** — Dark premium theme with use case tabs, feature cards, pricing, FAQ
- **Internationalization** — English/Spanish via lang files + Spatie DB translations
- **Multi-Tenant** — UUID-based tenant isolation on all resources

## Quick Start

```bash
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
php artisan db:seed
pnpm install
pnpm run build
```

## Roles

| Role   | Permissions |
|--------|-------------|
| Owner  | Full access, billing, owner-only actions |
| Admin  | Manage team members, flows |
| Member | View and use flows |

## Tech Stack

- **Backend**: Laravel 13, PHP 8.3, PostgreSQL, Redis, Horizon
- **Frontend**: React 19, Inertia 3, Tailwind CSS 4, Ziggy
- **Realtime**: Laravel Reverb
- **AI**: Twilio integration for voice calls
