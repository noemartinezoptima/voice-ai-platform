# Voice AI Platform — Profesionalización

> **Goal:** Llevar la plataforma a nivel enterprise con compliance (GDPR/CCPA), OAuth moderno, infraestructura profesional, voice cloning y RBAC.
> **Velocity:** 1 pt = 0.5 día hábil

---

## Epic 1: Compliance Framework (GDPR/CCPA) — 34 pts

### Sprint 1.1: Data Protection Settings + IVR Consent (13 pts)

**Technical Context**
- Tenants table already has JSON `settings` column
- Twilio inbound call handled in `CallController.php` via TwiML response
- Activity log exists via spatie/laravel-activitylog
- Research: Twilio `<Gather>` with DTMF `finishOnKey`, `<Say>` for TTS disclosure

#### Task 1.1.1 — Migration: `data_protection` JSON column (2 pts)

- Migration: `tenants` table, `data_protection` JSON/TEXT NOT NULL DEFAULT '{}'
- Structure at runtime:
  - `consent_required` (bool, default false)
  - `retention_days` (int, default 90)
  - `consent_message` (string, default: "This call may be recorded for quality and training purposes. By continuing, you consent to recording.")
  - `consent_recordings` (bool, default true)
  - `consent_transcripts` (bool, default true)
- Cast in `TenantModel`: `'data_protection' => 'array'`

#### Task 1.1.2 — Settings/DataProtection React page (3 pts)

- `app/Http/Controllers/Web/DataProtectionController.php`
  - `edit()`: return Inertia page with current settings
  - `update()`: validate + save to tenant
- `resources/js/Pages/Settings/DataProtection/Index.jsx`
  - Toggle: "Require caller consent before recording"
  - Toggle: "Apply consent to recordings" | "Apply consent to transcripts"
  - Select: Retention period (30, 60, 90, 180, 365)
  - Textarea: Disclosure message (with placeholder default)
  - Save button with flash message
- Validation rules:
  - `consent_message: required_if:consent_required,true|string|max:500`
  - `retention_days: required|integer|in:30,60,90,180,365`
  - `consent_required: boolean`
  - `consent_recordings: boolean`
  - `consent_transcripts: boolean`
- Route: `GET /settings/data-protection`, `PATCH /settings/data-protection`
- Gate: `viewSettings` or `update` (existing pattern)

#### Task 1.1.3 — IVR Consent Disclosure in Twilio webhook (5 pts)

- Modify `app/Http/Controllers/Twilio/CallController.php`:
  - After tenant lookup, check `$tenant->data_protection['consent_required']`
  - If true: return TwiML with `<Gather>` + `<Say>` disclosure, do NOT forward to flow yet
  - If false: existing behavior (forward to flow)
- New endpoint `POST /twilio/consent-callback` → `TwilioController@consentCallback`
  - If `Digits == 1`: log `consent_granted`, redirect to normal flow entry point
  - If `Digits != 1` or timeout: log `consent_declined`, `<Say>Goodbye</Say>` + `<Hangup/>`
- TwiML structure:
  ```xml
  <Response>
    <Gather action="https://app.test/twilio/consent-callback" numDigits="1" timeout="5">
      <Say>{$disclosureMessage}</Say>
      <Say>Press 1 to accept, or any other key to decline.</Say>
    </Gather>
    <Say>You did not provide consent. Goodbye.</Say>
    <Hangup />
  </Response>
  ```
- Log via `activity()` with properties:
  - `event`: `consent_granted` | `consent_declined`
  - `properties.caller`: caller number
  - `properties.call_sid`: Twilio CallSid
  - `properties.tenant_id`: tenant UUID

#### Task 1.1.4 — Consent Logging (2 pts)

- Wire existing activity log to capture consent events
- Viewable from Privacy Dashboard (Sprint 1.3)

#### Task 1.1.5 — Tests (1 pt)

- `tests/Feature/Web/DataProtectionPageTest.php`
  - GET /settings/data-protection → 200
  - PATCH /settings/data-protection with valid data → redirect + db updated
  - PATCH with invalid retention → validation error
  - Non-owner → 403
- `tests/Feature/Twilio/ConsentDisclosureTest.php`
  - Inbound call with consent_required=true → TwiML contains `<Gather>` + `<Say>`
  - POST /twilio/consent-callback with Digits=1 → redirect to flow
  - POST /twilio/consent-callback with Digits=2 → hangup
  - POST /twilio/consent-callback timeout → hangup
  - Inbound call with consent_required=false → normal flow (no Gather)
  - Activity log entries created

### Sprint 1.2: Data Lifecycle (13 pts)

#### Task 1.2.1 — `data:purge-expired` scheduled job (3 pts)

- `app/Console/Commands/PurgeExpiredData.php`
  - Iterates all tenants with `data_protection.retention_days`
  - Deletes recordings from `Storage::disk('recordings')` where `created_at < now() - retention_days`
  - Purges `call_logs` rows beyond retention via Eloquent `where('created_at', '<', ...)->delete()`
  - Purges transcripts (if stored as files or DB)
  - Logs summary to activity_log per tenant
- `routes/console.php`: `$schedule->command('data:purge-expired')->daily()->at('03:00')`
- Configurable via `.env`: `DATA_PURGE_BATCH_SIZE=100`

#### Task 1.2.2 — Right to Be Forgotten endpoint (5 pts)

- `DELETE /api/tenant/data` → `app/Http/Controllers/Api/DataDeletionController.php`
- Policy: `Gate::allows('delete', $tenant)` (owner only)
- Sequential actions:
  1. Delete all recording files from `Storage::disk('recordings')` matching tenant calls
  2. Soft-delete or anonymize calls: set `caller = 'deleted'`, `to = 'deleted'`, clear recording_url
  3. Delete all `call_logs` for tenant calls
  4. Clear transcript data
  5. Anonymize tenant: `name = "Deleted Tenant {id}"`, `settings = '{}'`
  6. Anonymize users: `email = "deleted-{id}@example.com"`, `name = "Deleted User"`
  7. Set `data_protection.deleted_at = now()` on tenant
- Response 200: `{ "message": "Data deleted", "deleted_calls": 42, "deleted_recordings": 15 }`
- Log to activity_log: event `data_deleted` with counts
- Exception: non-owner → 403, unauthenticated → 401

#### Task 1.2.3 — Data Export endpoint (3 pts)

- `GET /api/tenant/data/export` → `app/Http/Controllers/Api/DataExportController.php`
- Policy: owner only
- Generates JSON response:
  ```json
  {
    "exported_at": "2026-07-12T...",
    "tenant": { "name": "...", "plan": "pro", "created_at": "..." },
    "calls": [ { "sid": "...", "from": "+1...", "to": "+1...", "duration": 120, "status": "completed", "direction": "inbound", "created_at": "..." } ],
    "recordings": [ { "url": "...", "duration": 120, "created_at": "..." } ],
    "flows": [ { "name": "Support Flow", "status": "active" } ],
    "webhooks": [ { "url": "...", "events": ["call.completed"], "is_active": true } ]
  }
  ```
- If total size < 50MB: returns zip with JSON + recording files via `Storage::temporaryUrl()` (1h expiry)
- If > 50MB: returns JSON-only, recordings available as separate download links
- Log to activity_log: event `data_exported`
- Exception: non-owner → 403

#### Task 1.2.4 — Tests (2 pts)

- `tests/Feature/Commands/PurgeExpiredDataTest.php`
  - Create calls within/outside retention window
  - Run command → assert old calls deleted, recent kept
  - Run with no expired data → no-op
- `tests/Feature/Api/DataDeletionControllerTest.php`
  - DELETE as owner → 200 + data cleared
  - DELETE as non-owner → 403
  - DELETE on already-deleted tenant → 200 (idempotent)
- `tests/Feature/Api/DataExportControllerTest.php`
  - GET as owner → 200 + JSON structure
  - GET as non-owner → 403

### Sprint 1.3: Privacy Dashboard (8 pts)

#### Task 1.3.1 — Privacy section in Settings (3 pts)

- `resources/js/Pages/Settings/Privacy/Index.jsx`
  - Data summary cards: Total recordings, Storage used, Total calls, Oldest data point
  - Consent logs table: paginated from activity_log filtered by `consent_granted`/`consent_declined`
  - "Export Data" button → calls export API
  - "Delete All Data" button → confirm dialog → calls deletion API
- `PrivacyController@index` returns:
  ```php
  'summary' => [
      'total_calls' => $callsCount,
      'total_recordings' => $recordingsCount,
      'storage_bytes' => $storageBytes,
      'oldest_data' => $oldestCall?->created_at,
  ],
  'consent_logs' => Activity::where(...)->paginate(15),
  ```
- Route: `GET /settings/privacy`

#### Task 1.3.2 — Data Map visualization (3 pts)

- Section within Privacy.jsx
- Categories with counts:
  - **Accounts**: users count, roles breakdown
  - **Communications**: calls count, SMS count
  - **Recordings**: count, total duration, storage
  - **Configuration**: flows, webhooks, agents, voices
- Each row: data type / storage location / retention period / encryption at rest (yes/no)
- Read-only, computed from actual data

#### Task 1.3.3 — Weekly Compliance Email (2 pts)

- `app/Mail/ComplianceDigest.php`
  - Subject: "Your Weekly Compliance Summary — {tenant_name}"
  - Content: recordings count, approaching retentions (7 days), pending deletions, last export date
- `app/Console/Commands/SendComplianceDigests.php`
  - Schedule: `$schedule->command('compliance:digest')->weekly()->mondays()->at('08:00')`
  - Iterates tenants, sends to owners with verified email
- Log to activity_log: event `compliance_digest_sent`

---

## Epic 2: Twilio OAuth + ElevenLabs Credential Manager — 35 pts

### Sprint 2.1: Twilio OAuth Apps (Authorization Code flow) — 18 pts

**Technical Context**
- Research: Twilio OAuth Apps (beta) vs Twilio Connect. Using OAuth Apps for short-lived tokens + refresh + scoped permissions.
- Auth URL: `https://oauth.twilio.com/v2/authorize`
- Token URL: `https://oauth.twilio.com/v2/token`
- Must create OAuth App in Twilio Console → client_id + client_secret
- Scopes needed: `account:read`, `call:read`, `call:write`, `sms:read`, `sms:write`, `phone_numbers:write`

#### Task 2.1.1 — Config + env vars (1 pt)

- `.env`:
  ```
  TWILIO_OAUTH_CLIENT_ID=xxx
  TWILIO_OAUTH_CLIENT_SECRET=yyy
  TWILIO_OAUTH_REDIRECT_URL=https://app.test/twilio/oauth/callback
  ```
- `config/twilio-oauth.php`:
  ```php
  return [
      'client_id' => env('TWILIO_OAUTH_CLIENT_ID'),
      'client_secret' => env('TWILIO_OAUTH_CLIENT_SECRET'),
      'redirect_url' => env('TWILIO_OAUTH_REDIRECT_URL'),
      'scopes' => ['account:read', 'call:read', 'call:write', 'sms:read', 'sms:write', 'phone_numbers:write'],
      'authorize_url' => 'https://oauth.twilio.com/v2/authorize',
      'token_url' => 'https://oauth.twilio.com/v2/token',
  ];
  ```

#### Task 2.1.2 — "Connect Twilio" button + redirect (3 pts)

- `resources/js/Components/ConnectTwilioButton.jsx`
  - Renders anchor with href pointing to:
    ```
    https://oauth.twilio.com/v2/authorize?client_id={CLIENT_ID}&response_type=code&scope={SCOPES}&redirect_uri={REDIRECT_URL}&state={STATE}
    ```
  - STATE generation: `Crypt::encryptString(json_encode(['tenant_id' => tenantId, 'user_id' => userId, 'created_at' => now()->timestamp]))`
  - Passes CLIENT_ID + STATE from server (never expose client_secret)
- Placement: inline in Settings/Twilio.jsx (or new TwilioOAuth.jsx section)
- Button text: "Connect Twilio Account"
- Existing manual API Key/Auth Token fields remain visible until connected

#### Task 2.1.3 — Callback handler (5 pts)

- `app/Http/Controllers/Web/TwilioOAuthController.php`
- `callback(Request $request)`:
  1. Validate `state` parameter: decrypt, verify tenant_id matches current tenant, user_id matches auth user
  2. If state invalid: redirect to /settings/twilio with error "Authorization expired. Please try again."
  3. POST to `https://oauth.twilio.com/v2/token`:
     ```
     client_id={CLIENT_ID}&client_secret={CLIENT_SECRET}&grant_type=authorization_code&code={CODE}&redirect_uri={REDIRECT_URL}
     ```
  4. If token endpoint returns error: redirect with error "Twilio authorization failed. Please try again."
  5. Parse response:
     ```json
     { "access_token": "...", "refresh_token": "...", "expires_in": 3600, "token_type": "Bearer" }
     ```
  6. Store in `tenant.settings.twilio_oauth`:
     ```json
     {
       "access_token": "<encrypted>",
       "refresh_token": "<encrypted>",
       "expires_at": <unix>,
       "account_sid": "<from /v2/Accounts/me via access_token>",
       "connected_at": "<ISO date>"
     }
     ```
  7. Set `tenant.settings.twilio_oauth_enabled = true`
  8. Redirect to /settings/twilio?connected=success

#### Task 2.1.4 — Connected status UI + replace manual fields (3 pts)

- Settings/Twilio.jsx:
  - If `twilio_oauth_enabled`:
    - Green status card: "✅ Connected as ACxxxxx (connected {date})"
    - Disconnect button (outline danger style)
    - Hide or disable manual API Key / Auth Token fields
    - Show "Twilio OAuth" as credential source
  - If not connected:
    - Show ConnectTwilioButton
    - Show manual API Key / Auth Token fields as today (existing functionality)
- Flash messages: "Twilio account connected successfully" | "Twilio account disconnected"

#### Task 2.1.5 — Disconnect + Token Refresh (3 pts)

- `TwilioOAuthController@disconnect()`:
  1. Revoke token: `POST https://oauth.twilio.com/v2/revoke` with `token=ACCESS_TOKEN`
  2. Clear `tenant.settings.twilio_oauth`
  3. Set `tenant.settings.twilio_oauth_enabled = false`
  4. Redirect with flash "Twilio account disconnected"
- Token refresh middleware/service:
  - `App\Services\TwilioOAuthService::getValidAccessToken(Tenant $tenant): string`
  - Check `expires_at - 300 < now()` → if expired, POST refresh token
  - Refresh: `POST https://oauth.twilio.com/v2/token` with `grant_type=refresh_token&refresh_token=...`
  - Update stored access_token + expires_at
  - If refresh fails (invalid_grant): mark disconnected, notify owner
- Wire into existing Twilio service calls where tenant API key is used

#### Task 2.1.6 — Tests (3 pts)

- `tests/Feature/Web/TwilioOAuthControllerTest.php`
  - GET redirect generates URL with correct client_id, response_type, scope, redirect_uri, state
  - Callback with valid state + mock token response → stores credentials
  - Callback with invalid state → error flash
  - Callback with expired state → error flash
  - Callback with failed token exchange → error flash
  - Disconnect → clears credentials
  - Refresh token flow (mock expired, mock refresh response)
  - Non-owner cannot connect/disconnect

### Sprint 2.2: ElevenLabs Credential Manager (17 pts)

**Technical Context**
- ElevenLabs has no OAuth. Only `xi-api-key` header auth.
- `GET /v1/user` returns `{ user_id, xi_api_key_preview, subscription: { tier, character_count, character_limit } }`
- `GET /v1/user/subscription` returns extended subscription info
- Laravel `'encrypted'` cast uses AES-256 with APP_KEY, requires TEXT column

#### Task 2.2.1 — Encrypted storage for elevenlabs_api_key (2 pts)

- `TenantModel`: add `'elevenlabs_api_key' => 'encrypted'` to `casts()`
- Ensure column in `tenants.settings` JSON can hold encrypted value (TEXT size)
- If current column is VARCHAR, migration to change type or rely on JSON flexibility
- Encrypted at rest automatically via Laravel cast system
- Optional: `Model::encryptUsing()` for dedicated key (future)
- Existing `elevenlabs_*` fields in settings remain unencrypted (account info, not credentials)

#### Task 2.2.2 — "Connect ElevenLabs" button + modal (3 pts)

- `Settings/ElevenLabs.jsx` section:
  - If not connected: "Connect ElevenLabs" button → opens modal
  - Modal content:
    - API Key input (password field)
    - "Test & Connect" button with loading spinner
    - Error message area (invalid key, network error)
  - Connected state shows account info card (Task 2.2.3)

#### Task 2.2.3 — Test connection + display account info (3 pts)

- `app/Http/Controllers/Web/ElevenLabsConnectController@connect`:
  1. Validate `api_key` present, string, min 20 chars
  2. `Http::withHeaders(['xi-api-key' => $apiKey])->get('https://api.elevenlabs.io/v1/user')`
  3. If 200:
     - Parse: `{ user_id, xi_api_key_preview, subscription: { tier } }`
     - Also fetch: `GET /v1/user/subscription` for character usage
     - Store in tenant settings:
       ```json
       {
         "elevenlabs_api_key": "<encrypted>",
         "elevenlabs_account_id": "user_xxx",
         "elevenlabs_account_email": null,
         "elevenlabs_subscription_tier": "creator",
         "elevenlabs_character_count": 5000,
         "elevenlabs_character_limit": 30000,
         "elevenlabs_connected_at": "2026-07-12T..."
       }
       ```
     - Return JSON: `{ success: true, account: { user_id, tier, character_count, character_limit } }`
  4. If 401: return validation error "Invalid API key. Please check and try again."
  5. If other error: return validation error "Could not connect to ElevenLabs. Please try again."
- `ElevenLabsConnectController@status`:
  - Returns account info from tenant settings (unencrypted fields only)
- Account info card in UI:
  - Connected status badge (green)
  - Account ID / email
  - Subscription tier (free/creator/pro)
  - Character usage bar: `{character_count} / {character_limit}`

#### Task 2.2.4 — Health check cron (3 pts)

- `app/Console/Commands/ElevenLabsHealthCheck.php`
- Schedule: `$schedule->command('elevenlabs:health-check')->weekly()`
- Logic:
  1. Get all tenants with `elevenlabs_api_key` set
  2. `Http::withHeaders(['xi-api-key' => $decryptedKey])->get('https://api.elevenlabs.io/v1/user')`
  3. If 200: update `elevenlabs_character_count` + `elevenlabs_character_limit` (keep fresh)
  4. If 401:
     - Set `elevenlabs_health_status = 'invalid'`
     - Notify tenant owner: dispatch `ElevenLabsKeyInvalid` notification (email + in-app)
     - Log to activity_log: `elevenlabs_key_invalid`
  5. If network error: set `elevenlabs_health_status = 'unreachable'`, skip notification (will retry next week)
- Notification: `app/Notifications/ElevenLabsKeyInvalid.php`
  - Subject: "ElevenLabs API key needs attention"
  - Content: "Your ElevenLabs API key for {tenant_name} is no longer valid. Please reconnect in Settings > ElevenLabs."

#### Task 2.2.5 — Key rotation from UI (3 pts)

- "Reconnect" button in Settings/ElevenLabs.jsx
- Opens same modal as connect with title "Update ElevenLabs API Key"
- On submit: calls same `ElevenLabsConnectController@connect` endpoint
  - Replaces existing key + account info
  - Resets `elevenlabs_health_status` to null
- Log to activity_log: event `elevenlabs_key_rotated`

#### Task 2.2.6 — Tests (3 pts)

- `tests/Feature/Web/ElevenLabsConnectControllerTest.php`
  - Connect with valid key (mock user 200 + subscription 200) → saves data + returns success
  - Connect with invalid key (mock 401) → validation error
  - Connect with network error (mock HttpException) → validation error
  - Reconnect → replaces existing data
  - Status endpoint returns account info
  - Encrypted storage: assert DB stores encrypted value, attribute returns plaintext
  - Non-owner → 403
- `tests/Feature/Commands/ElevenLabsHealthCheckTest.php`
  - Health check with valid key → updates character counts
  - Health check with invalid key → sets health_status + dispatches notification
  - Health check with no connected tenants → no-op

---

## Epic 3: Professional Infrastructure — 28 pts

### Sprint 3.1: Observability (13 pts)

#### Task 3.1.1 — Health endpoint (2 pts)

- `GET /api/health` (no auth required)
- `app/Http/Controllers/Api/HealthController.php`
- Checks:
  - `database`: `DB::connection()->getPdo()` → ok or error
  - `redis`: `Redis::connection()->ping()` → ok or error
  - `queue_size`: via `Queue::size()` on each queue → ok if < 50, degraded if >= 50
- Response:
  ```json
  {
    "status": "ok" | "degraded",
    "timestamp": "2026-07-12T12:00:00Z",
    "services": {
      "database": "ok",
      "redis": "ok",
      "queue": "ok"
    },
    "version": "1.0.0",
    "uptime_seconds": 12345
  }
  ```
- If any service fails → status: "degraded", individual service: "error"
- Version from `config('app.version')` or git tag

#### Task 3.1.2 — System Health Dashboard (5 pts)

- `Settings/System/Index.jsx`
- `SystemHealthController@index` returns:
  - Queue depth per queue (from Horizon stats or Redis keys)
  - Failed jobs count (last 24h)
  - Call error rate (failed calls / total calls, last 1h + 24h)
  - Worker status (online since timestamp)
  - API rate limit hits per limiter
  - Failed jobs list with retry button
- Charts via recharts (existing in project):
  - Queue depth over time (line chart, last 24h)
  - Error rate over time (area chart, last 24h)
- Route: `GET /settings/system`

#### Task 3.1.3 — Alert system (3 pts)

- `app/Notifications/SystemAlert.php`
  - Channels: `mail` + `slack` (if configured)
  - `toMail()`: formatted summary
  - `toSlack()`: Slack attachment with color-coded severity
- `app/Console/Commands/CheckSystemHealth.php`:
  - Schedule: `$schedule->command('system:health-check')->everyFiveMinutes()`
  - Check conditions:
    - Queue backlog > 50 jobs → alert
    - Call failure rate > 10% in last 5 min → alert
    - Worker queue offline > 5 min → alert
  - Rate-limited: same alert not sent more than once per hour per tenant
- `config/alerting.php`:
  ```php
  'slack_webhook' => env('ALERT_SLACK_WEBHOOK'),
  'email' => env('ALERT_EMAIL'),
  'rate_limit_minutes' => 60,
  ```

#### Task 3.1.4 — Tests (3 pts)

- `tests/Feature/Api/HealthEndpointTest.php`
  - GET /api/health → 200 + correct JSON structure
  - Mock DB failure → status "degraded"
- `tests/Feature/Web/SystemHealthControllerTest.php`
  - GET /settings/system → 200 + data shape
- `tests/Feature/Commands/CheckSystemHealthTest.php`
  - Mock queue depth > 50 → notification dispatched
  - Mock queue depth < 50 → no notification
  - Rate limiting: duplicate alert within 1h → suppressed

### Sprint 3.2: Security Hardening (10 pts)

#### Task 3.2.1 — AES-256 recording encryption (3 pts)

- Add `RECORDINGS_ENCRYPTION_KEY` to `.env` (base64, 32 bytes)
- `app/Services/RecordingEncryptionService.php`:
  - `encrypt(Stream $input): Stream` — wraps stream with AES-256-GCM
  - `decrypt(Stream $input): Stream` — wraps stream with decryption
  - Uses `\Illuminate\Encryption\Encrypter` with dedicated key
- Wire into recording storage:
  - Wherever recordings are saved from Twilio, encrypt before writing
  - Wherever recordings are served/played, decrypt on read
  - Existing recordings left as-is (only new recordings encrypted)
- Documented in code: "Only new recordings are encrypted. Rotating key requires re-encryption."

#### Task 3.2.2 — API tokens with optional TTL (3 pts)

- Migration: `personal_access_tokens` add `expires_at` nullable timestamp
- `app/Http/Middleware/CheckTokenExpiry.php`:
  - For Sanctum requests, check `$token->expires_at`
  - If expired: return 401 "Token expired"
- API Token create modal in UI:
  - Add "Expires in" select: Never / 30 days / 90 days / 1 year
  - On create: if not "Never", calculate `expires_at = now()->addDays(N)`
- `app/Console/Commands/PurgeExpiredTokens.php`:
  - `Token::where('expires_at', '<', now())->delete()`
  - Schedule: `$schedule->command('tokens:purge-expired')->daily()`

#### Task 3.2.3 — Security headers + per-tenant rate limiting (2 pts)

- `app/Http/Middleware/SecurityHeaders.php`:
  ```php
  $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  $response->headers->set('X-Content-Type-Options', 'nosniff');
  $response->headers->set('X-Frame-Options', 'DENY');
  $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
  $response->headers->set('Permissions-Policy', 'geolocation=(self), microphone=(self)');
  ```
- Register in `bootstrap/app.php` middleware stack
- Per-tenant rate limiting:
  ```php
  RateLimiter::for('api_tenant', fn ($job) => Limit::perMinute(100)->by($job->tenant_id));
  ```
  Applied to API routes group via `throttle:api_tenant`

#### Task 3.2.4 — Tests (2 pts)

- `tests/Feature/Middleware/SecurityHeadersTest.php`
  - Assert HSTS, X-Content-Type-Options, X-Frame-Options headers present
- `tests/Feature/Middleware/CheckTokenExpiryTest.php`
  - Request with expired token → 401
  - Request with valid token → 200
- Rate limiting test: assert per-tenant limit isolates correctly

### Sprint 3.3: Onboarding & Docs (5 pts)

#### Task 3.3.1 — Getting Started Wizard (3 pts)

- Post-registration redirect to `/getting-started` if `tenant.settings.onboarding_completed` is not set
- `app/Http/Controllers/Web/GettingStartedController.php`
- Stepper UI (4 steps):
  1. **Connect Twilio** — if not connected, show ConnectTwilioButton. If connected, green checkmark
  2. **Connect ElevenLabs** — if not connected, show Connect button. If connected, account info card
  3. **Create First Flow** — link to /flows with empty state CTA
  4. **Test Call** — show assigned phone number, instructions for test call
- On completion: set `tenant.settings.onboarding_completed = true`, redirect to /dashboard
- Skip link on each step
- `resources/js/Pages/GettingStarted/Index.jsx`
- Route: `GET /getting-started` (only if not completed)

#### Task 3.3.2 — API documentation (2 pts)

- Install `knuckleswtf/scribe` (if not present) or use `l5-swagger`
- Document:
  - `GET /api/health`
  - `GET /api/tenant/data/export`
  - `DELETE /api/tenant/data`
  - `POST /twilio/*` (inbound webhooks)
  - `POST /twilio/sms/inbound`
- UI at `/docs` route
- Generate on deploy via `php artisan scribe:generate`

---

## Epic 5: Voice Customization — 21 pts

### Sprint 5.1: Voice Cloning Studio (13 pts)

**Technical Context**
- Research: `POST /v1/voices/add` (multipart form). Fields: name (required), files[] (required, audio), remove_background_noise (bool), description, labels
- Response: `{ voice_id (string, uuid), requires_verification (bool) }`
- Also `POST /v1/voices/add/{public_user_id}/{voice_id}` to add shared voices
- Max file size: ~25MB per sample, 3-12 samples recommended. Formats: MP3, WAV, FLAC, M4A

#### Task 5.1.1 — Migration: `custom_voices` table (2 pts)

- `custom_voices`:
  - `id` UUID primary key
  - `tenant_id` FK → tenants
  - `elevenlabs_voice_id` string (UUID from ElevenLabs)
  - `name` string (required)
  - `preview_url` nullable string (ElevenLabs audio preview URL)
  - `sample_count` integer default 0
  - `description` nullable string
  - `labels` nullable JSON (language, accent, gender, age)
  - `is_default` boolean default false
  - `requires_verification` boolean default false
  - `created_at` / `updated_at` timestamps

#### Task 5.1.2 — Settings/Voices page — list + preview (3 pts)

- `VoiceController@index` returns paginated list of custom voices per tenant
- `resources/js/Pages/Settings/Voices/Index.jsx`
  - Table: Name, Sample count, Preview (play button), Default badge, Actions
  - Play button: opens audio player for `preview_url` (ElevenLabs serves audio)
  - "Clone Voice" button (opens clone modal)
  - Empty state: "No custom voices yet. Clone your first voice to get started."

#### Task 5.1.3 — Clone Voice modal (5 pts)

- Modal "Clone Voice":
  - Name input
  - File upload: drag & drop or select audio files (MP3, WAV, FLAC, M4A; max 3 files, 25MB each)
  - Progress indicator during upload
  - Optional: Remove background noise toggle
  - Optional: Description textarea
  - "Clone" button
- Backend: `VoiceController@store`
  1. Validate: name required, files required (max 3, mimes:mp3,wav,flac,m4a, max:25000kb each)
  2. `Http::attach()` each file → `POST https://api.elevenlabs.io/v1/voices/add` with xi-api-key header
  3. Response `{ voice_id, requires_verification }`
  4. Store in `custom_voices` table
  5. Get `preview_url` via `GET /v1/voices/{voice_id}` (contains samples[0].preview_url or use generated URL)
  6. Return with flash "Voice cloned successfully"
- Error handling: ElevenLabs API error → user-friendly message

#### Task 5.1.4 — Assign cloned voice to flow (2 pts)

- `FlowModel` has existing `elevenlabs_voice_id` field
- Modify flow form (Settings/Flows/Form.jsx or wherever):
  - Voice selector dropdown: options from `custom_voices` (name) + ElevenLabs default voices
  - On select, set `elevenlabs_voice_id` to the cloned voice's elevenlabs_voice_id
  - Fallback to `config('elevenlabs.default_voice_id')` if none selected
- `VoiceController@available` returns voices list for dropdown

#### Task 5.1.5 — Tests (1 pt)

- `tests/Feature/Web/VoiceCloningControllerTest.php`
  - List voices (empty) → 200
  - Clone with valid file mock → stores record
  - Clone with no files → validation error
  - Clone with invalid file type → validation error
  - Delete voice → removed from DB
  - Non-owner → 403

### Sprint 5.2: Voice Management (8 pts)

#### Task 5.2.1 — Delete voice + ElevenLabs cleanup (2 pts)

- `VoiceController@destroy($id)`:
  1. `DELETE https://api.elevenlabs.io/v1/voices/{elevenlabs_voice_id}` (removes from ElevenLabs too)
  2. Delete from `custom_voices` table
  3. Flash "Voice deleted"
- Confirm dialog in UI: "Delete this voice? It will be removed from ElevenLabs and all flows using it."
- Log to activity_log: event `voice_deleted`

#### Task 5.2.2 — Voice detail view + waveform (2 pts)

- Click on voice row → detail panel or page:
  - Name, description, labels
  - Waveform visualization (via simple canvas or existing library)
  - Duration of each sample
  - Download original sample link (from ElevenLabs)
  - Verification status (if `requires_verification`, show badge)

#### Task 5.2.3 — Default voice per tenant (2 pts)

- Setting in Settings/Voices: "Default Voice" selector
- On save: set `is_default = false` on all other tenant voices, `is_default = true` on selected
- When creating new flow: pre-select default voice if set
- Store reference: `voice_id` in tenant settings `default_voice_id`

#### Task 5.2.4 — Tests (2 pts)

- Delete voice → assert DB + ElevenLabs API call
- Set default → assert correct behavior
- Detail view → 200 + data shape
- Non-owner → 403

---

## Epic 4: Enterprise (future reference) — ~20 pts

### Sprint 4.1: RBAC Refine (8 pts)

#### Task 4.1.1 — Fine-grained permissions (3 pts)
- Review existing Spatie Permission setup
- Add specific permissions: `flows.create`, `flows.delete`, `team.manage`, `billing.view`, `calls.export`, `webhooks.manage`, `agents.manage`
- Migrate roles (owner/admin/member) to use new permission schema
- Create default role-permission mapping:
  - Owner: all permissions
  - Admin: all except billing and team management
  - Member: flows.create, flows.read, calls.read, webhooks.read

#### Task 4.1.2 — Permission management UI (3 pts)
- Settings/Roles page — list roles with permission checkboxes
- Team member management — role assignment with permission summary
- Read-only for non-owner

#### Task 4.1.3 — Tests (2 pts)

### Sprint 4.2: Tenant-level Encryption Keys (7 pts)

#### Task 4.2.1 — Per-tenant key generation (3 pts)
- On tenant create: generate `TENANT_ENCRYPTION_KEY` (random 32 bytes, base64)
- Store: `tenant.encryption_key` with `encrypted` cast (encrypted with APP_KEY)
- Use `Model::encryptUsing()` with tenant key for `elevenlabs_api_key` and `data_protection` fields

#### Task 4.2.2 — Key rotation UI (2 pts)
- "Rotate encryption key" button in Settings/Security
- Re-encrypt existing encrypted fields with new key
- Log event

#### Task 4.2.3 — Tests (2 pts)

### Sprint 4.3: SSO/SAML Readiness (5 pts)

#### Task 4.3.1 — SSO config (3 pts)
- `config/sso.php` + migration for `sso_providers`
- Support SAML metadata upload
- IdP-initiated SSO
- "Continue with SSO" button on login page

#### Task 4.3.2 — Tests (2 pts)

---

## Summary

| Epic | Total Pts | Sprints | Est. Weeks (1 sprint/wk) |
|---|---|---|---|
| 1: Compliance | 34 | 3 | 3 |
| 2: OAuth + Credential Mgmt | 35 | 2 | 2 |
| 3: Infrastructure | 28 | 3 | 3 |
| 5: Voice Customization | 21 | 2 | 2 |
| **Subtotal** | **118** | **10** | **10** |
| 4: Enterprise (future) | ~20 | 3 | 3 |
| **Total** | **~138** | **13** | **~13** |

**Parallelization:** Epics 2 and 3 can run in parallel with Epics 1 and 5 (different systems). Estimated wall clock: 7-8 weeks with 2 streams.

---

## Appendix: Research Sources

- Twilio OAuth Apps: `https://oauth.twilio.com/v2/authorize`, `https://oauth.twilio.com/v2/token`
- Twilio `<Gather>`: `https://www.twilio.com/docs/voice/twiml/gather`
- Twilio Recording Legal: `https://support.twilio.com/hc/en-us/articles/360011522553`
- ElevenLabs Voice Clone: `POST /v1/voices/add` multipart form (name + files[] + optional params)
- ElevenLabs User: `GET /v1/user` (user_id, xi_api_key_preview, subscription)
- ElevenLabs Subscription: `GET /v1/user/subscription` (tier, character_count, character_limit)
- Laravel Encrypted Casts: `'encrypted'` in `$casts`, AES-256 with `APP_KEY`, column must be TEXT
- Laravel `Model::encryptUsing()`: custom encrypter with separate key
