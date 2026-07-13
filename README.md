# Voice AI Platform

Voice AI platform for building, deploying, and monitoring AI-powered voice
applications. Supports IVR flows, SMS automation, WhatsApp messaging,
knowledge retrieval, and real-time monitoring.

## Tech Stack

- **Backend:** Laravel 13, PHP 8.3, PostgreSQL
- **Frontend:** React 19, Inertia 2, Tailwind CSS v4, Catalyst UI
- **Real-time:** Laravel Reverb (WebSocket)
- **AI:** ElevenLabs (voice synthesis, cloning, agents), OpenAI (LLM, embeddings)
- **Telephony:** Twilio (voice, SMS, WhatsApp)
- **Queue:** Laravel Horizon (Redis)
- **Testing:** PHPUnit 12, Laravel Dusk

## Features

- **IVR Flow Builder** — Visual drag-drop canvas with 9 node types (say, ask, LLM, condition, transfer, webhook, knowledge, goto, hangup)
- **Real-time Monitor** — Live call dashboard with WebSocket updates, transcript streaming
- **Voice Cloning** — Clone custom voices via ElevenLabs API with drag-drop audio upload
- **SMS + WhatsApp** — Two-way messaging with auto-reply rules and campaign sending
- **Conversation Analytics** — Sentiment analysis, keyword extraction, topic clustering
- **Transcription Search** — Full-text search across call transcripts with highlighting
- **Knowledge Base** — RAG-powered document ingestion with chunking and retrieval
- **Compliance** — GDPR-ready: IVR consent, data retention, GDPR export/deletion
- **Multi-tenant** — Tenant isolation with Spatie RBAC (3 roles, 11 permissions)
- **API + Webhooks** — REST API with Sanctum tokens, webhook destinations per tenant
- **OAuth** — Twilio OAuth Apps integration for credential-free connect
- **Audit Log** — Full activity tracking via spatie/laravel-activitylog

## Quick Start

### Prerequisites
- PHP 8.3+
- PostgreSQL 15+
- Node.js 22+
- pnpm
- Composer

### Installation

```bash
# Clone
git clone <repo-url>
cd voice-ai-platform

# Install dependencies
composer install
pnpm install

# Environment
cp .env.example .env
php artisan key:generate

# Configure your .env with:
#   - Database (DB_*)
#   - Twilio credentials
#   - ElevenLabs API key (optional)
#   - OpenAI API key (optional)

# Run migrations + seed
php artisan migrate --seed

# Build frontend
pnpm run build

# Start queue worker
php artisan horizon

# Start WebSocket server (for live monitoring)
php artisan reverb:start

# Start dev server (or use Laravel Herd)
php artisan serve
```

### Testing
```bash
# All tests
php artisan test

# PHPStan static analysis
composer phpstan

# Code formatting
vendor/bin/pint

# Browser tests (requires pnpm run dev running)
php artisan dusk
```

## Architecture

The application follows a clean architecture / DDD-lite pattern:

```
app/
├── Domain/              # Business entities, value objects, interfaces
│   ├── Call/
│   ├── Flow/
│   ├── Tenant/
│   ├── Voice/
│   └── ...
├── Application/         # Use cases, DTOs, services
├── Infrastructure/      # Eloquent models, repositories, external APIs
│   ├── Persistence/Eloquent/
│   └── Services/
├── Http/
│   ├── Controllers/Web/     # Inertia page controllers
│   ├── Controllers/Api/     # REST API controllers
│   ├── Controllers/Auth/    # Auth controllers (Breeze)
│   ├── Controllers/Twilio/  # Twilio webhook handlers
│   └── Requests/            # Form requests
├── Jobs/                # Queued jobs
├── Events/              # Broadcast events
├── Listeners/           # Event listeners
├── Mail/                # Mailables
├── Notifications/       # Notifications
├── Observers/           # Model observers
├── Services/            # Application services
└── Providers/           # Service providers

resources/js/
├── Pages/               # Inertia page components
├── Components/          # Shared components (Catalyst, FlowBuilder, HighlightText)
├── Layouts/             # Page layouts
├── actions/             # Wayfinder auto-generated actions
└── routes/              # Wayfinder auto-generated routes
```

## Deployment

```bash
# Production build
pnpm run build

# Cache config/routes
php artisan optimize

# Run migrations
php artisan migrate --force

# Start Horizon (queue worker)
php artisan horizon

# Start Reverb (WebSocket)
php artisan reverb:start --host=0.0.0.0 --port=8080

# Schedule worker
* * * * * php /path/to/artisan schedule:run >> /dev/null 2>&1
```

## API Documentation

Run `php artisan scribe:generate` and visit `/docs` to see the API reference.

## Environment Variables

See `.env.example` for all available configuration options.
