# Database Schema & Seeding

## Schema

### tenants
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| name | string | |
| slug | string | Unique |
| settings | json | Timezone, language, notifications |
| is_active | boolean | |
| timestamps | | |

### users
| Column | Type | Notes |
|--------|------|-------|
| id | bigint | PK |
| name | string | |
| email | string | Unique |
| password | string | Hashed |
| tenant_id | uuid | FK → tenants, nullable |
| role | string | owner/admin/member |
| email_verified_at | timestamp | nullable |
| timestamps | | |

### flows
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| tenant_id | uuid | FK → tenants |
| name | string | |
| description | text | nullable |
| phone_number | string | nullable |
| config | json | Step definitions |
| is_active | boolean | |
| version | integer | |
| timestamps | | |

### calls
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| tenant_id | uuid | FK → tenants |
| flow_id | uuid | FK → flows, nullable |
| call_sid | string | Twilio SID, unique |
| from_number | string | |
| to_number | string | |
| status | string | initiated/in_progress/completed/failed/busy/no_answer/cancelled |
| duration_seconds | integer | |
| current_step | string | nullable |
| context | json | |
| error | text | nullable |
| started_at | timestamp | |
| ended_at | timestamp | nullable |
| timestamps | | |

### transcripts
| Column | Type | Notes |
|--------|------|-------|
| id | bigint | PK |
| call_id | uuid | FK → calls |
| role | string | agent/user |
| text | text | |
| start_offset_ms | integer | nullable |
| end_offset_ms | integer | nullable |
| confidence | float | nullable |
| metadata | json | |
| timestamps | | |

### call_logs
| Column | Type | Notes |
|--------|------|-------|
| id | bigint | PK |
| call_id | uuid | FK → calls |
| step_type | string | |
| step_id | string | nullable |
| input | text | nullable |
| output | text | nullable |
| metadata | json | |
| duration_ms | integer | |
| timestamps | | |

### tenant_invitations
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| tenant_id | uuid | FK → tenants |
| email | string | |
| role | string | admin/member |
| token | string | Unique |
| accepted_at | timestamp | nullable |
| timestamps | | |

### language_lines
| Column | Type | Notes |
|--------|------|-------|
| id | bigint | PK (Spatie package) |
| group | string | Namespace |
| key | string | Translation key |
| text | json | {en: "...", es: "..."} |
| timestamps | | |

## Seeding

```bash
# Full seed
php artisan db:seed

# Fresh + seed
php artisan migrate:fresh --seed
```

### Seed data

| Seeder | Data |
|--------|------|
| TenantSeeder | Acme Corp (MX, es), DevTest Labs (US, en) |
| UserSeeder | Carlos (owner), Ana (admin), Pedro (member) + John (owner) |
| FlowSeeder | Customer Support IVR, Appointment Reminder, Survey Caller |
| CallSeeder | 15 calls for Acme, 3 for DevTest — diverse statuses |
| ApiTokenSeeder | 3 Sanctum tokens with different abilities |
| LanguageLinesSeeder | 3 DB translation overrides (en+es) |
