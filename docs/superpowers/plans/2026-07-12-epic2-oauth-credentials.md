# Epic 2: Twilio OAuth + ElevenLabs Credential Manager — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans.

**Goal:** Add Twilio OAuth (Authorization Code flow) for secure credential management and an ElevenLabs credential manager with encrypted storage, health checks, and key rotation.

**Tech Stack:** Laravel 13, Twilio OAuth v2, Laravel `encrypted` cast, HTTP client, Inertia React

**Architecture:** Two parallel credential systems: Twilio OAuth uses Authorization Code flow with token refresh (tenant-level settings JSON with encrypted tokens), ElevenLabs uses API key validation + encrypted storage + periodic health checks. Both integrate into existing Settings pages with connect/disconnect UX.

## Global Constraints

- All UI uses Catalyst components (Heading, Text, Button, Input, Badge, Dialog, etc.)
- Laravel `'encrypted'` cast requires TEXT column (encrypted values exceed VARCHAR)
- Twilio OAuth: `oauth.twilio.com/v2/authorize` + `oauth.twilio.com/v2/token`
- ElevenLabs: no OAuth — `xi-api-key` header auth only
- All controller methods must handle authorization via `Gate::allows()` or tenant-owner check
- Routes registered in `routes/web.php` under `Route::middleware('auth')->group()`
- Wayfinder routes generated after new controllers added
- Tests use `RefreshDatabase`, tenant + user via factories, `Http::fake()` for external APIs

---

## Sprint 2.1: Twilio OAuth Apps (Authorization Code flow) — 18 pts

### Task 2.1.1: Config + env vars

**Files:**
- Create: `config/twilio-oauth.php`
- Modify: `.env` (add vars)

**Interfaces:**
- Consumes: nothing (foundational)
- Produces: `config('twilio-oauth.client_id')`, `config('twilio-oauth.scopes')`, etc.

- [ ] **Step 1:** Create config file

```php
<?php
// config/twilio-oauth.php
return [
    'client_id' => env('TWILIO_OAUTH_CLIENT_ID'),
    'client_secret' => env('TWILIO_OAUTH_CLIENT_SECRET'),
    'redirect_url' => env('TWILIO_OAUTH_REDIRECT_URL', '/twilio/oauth/callback'),
    'scopes' => ['account:read', 'call:read', 'call:write', 'sms:read', 'sms:write', 'phone_numbers:write'],
    'authorize_url' => 'https://oauth.twilio.com/v2/authorize',
    'token_url' => 'https://oauth.twilio.com/v2/token',
    'revoke_url' => 'https://oauth.twilio.com/v2/revoke',
];
```

- [ ] **Step 2:** Add env vars to `.env` (commented defaults)

```
TWILIO_OAUTH_CLIENT_ID=
TWILIO_OAUTH_CLIENT_SECRET=
TWILIO_OAUTH_REDIRECT_URL=
```

- [ ] **Step 3:** Commit

```bash
git add config/twilio-oauth.php .env.example
git commit -m "feat(oauth): add Twilio OAuth config"
```

### Task 2.1.2: Connect button + redirect

**Files:**
- Create: `resources/js/Components/ConnectTwilioButton.jsx`
- Modify: `resources/js/Pages/Settings/Tenant.jsx`
- Modify: `app/Http/Controllers/Web/TenantSettingsController.php` (pass OAuth state to view)
- Generate: Wayfinder routes for new controller

**Interfaces:**
- Consumes: `config('twilio-oauth.client_id')` via Inertia props
- Produces: OAuth redirect URL with encrypted state

- [ ] **Step 1:** Add `connectUrl` prop to TenantSettingsController::edit()

In `app/Http/Controllers/Web/TenantSettingsController.php`, add to `edit()`:

```php
$state = \Illuminate\Support\Facades\Crypt::encryptString(json_encode([
    'tenant_id' => $request->user()->tenant_id,
    'user_id' => $request->user()->id,
    'created_at' => now()->timestamp,
]));

$connectUrl = config('twilio-oauth.authorize_url') . '?' . http_build_query([
    'client_id' => config('twilio-oauth.client_id'),
    'response_type' => 'code',
    'scope' => implode(' ', config('twilio-oauth.scopes')),
    'redirect_uri' => config('twilio-oauth.redirect_url'),
    'state' => $state,
]);
```

Pass `$connectUrl` + `twilioOAuthEnabled` to Inertia render.

- [ ] **Step 2:** Create ConnectTwilioButton component

```jsx
// resources/js/Components/ConnectTwilioButton.jsx
import { Button } from '@/Components/catalyst/button';
import { Plug } from 'lucide-react';

export default function ConnectTwilioButton({ href, disabled }) {
    return (
        <Button outline href={href} disabled={disabled}>
            <Plug className="size-4" />
            Connect Twilio Account
        </Button>
    );
}
```

- [ ] **Step 3:** Add button to Tenant.jsx below Twilio section

Place `<ConnectTwilioButton>` below the Twilio fields, visible when not OAuth-connected.

- [ ] **Step 4:** Generate Wayfinder

```bash
php artisan wayfinder:generate
```

- [ ] **Step 5:** Commit

```bash
git add -A && git commit -m "feat(oauth): add Connect Twilio button + redirect"
```

### Task 2.1.3: Callback handler

**Files:**
- Create: `app/Http/Controllers/Web/TwilioOAuthController.php`
- Modify: `routes/web.php` (add callback + disconnect routes)

**Interfaces:**
- Consumes: OAuth state (encrypted), code from Twilio redirect
- Produces: `tenant.settings.twilio_oauth` with encrypted tokens

- [ ] **Step 1:** Create controller

```php
<?php
// app/Http/Controllers/Web/TwilioOAuthController.php
namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TwilioOAuthController extends Controller
{
    public function callback(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'state' => 'required|string',
        ]);

        try {
            $state = json_decode(Crypt::decryptString($request->input('state')), true);
        } catch (\Throwable) {
            return redirect()->route('settings.tenant')
                ->with('error', 'Authorization expired. Please try again.');
        }

        if (($state['tenant_id'] ?? null) !== $request->user()->tenant_id
            || ($state['user_id'] ?? null) !== $request->user()->id) {
            return redirect()->route('settings.tenant')
                ->with('error', 'Invalid authorization request.');
        }

        $tokenResponse = Http::asForm()->post(config('twilio-oauth.token_url'), [
            'client_id' => config('twilio-oauth.client_id'),
            'client_secret' => config('twilio-oauth.client_secret'),
            'grant_type' => 'authorization_code',
            'code' => $request->input('code'),
            'redirect_uri' => config('twilio-oauth.redirect_url'),
        ]);

        if (! $tokenResponse->successful()) {
            Log::warning('Twilio OAuth token exchange failed', [
                'status' => $tokenResponse->status(),
                'body' => $tokenResponse->body(),
            ]);
            return redirect()->route('settings.tenant')
                ->with('error', 'Twilio authorization failed. Please try again.');
        }

        $tokenData = $tokenResponse->json();

        // Get account SID from Twilio
        $accountResponse = Http::withToken($tokenData['access_token'])
            ->get('https://api.twilio.com/2010-04-01/Accounts/me.json');

        $accountSid = $accountResponse->json('sid') ?? null;

        $tenant = TenantModel::find($request->user()->tenant_id);
        $settings = $tenant->settings ?? [];
        $settings['twilio_oauth'] = [
            'access_token' => Crypt::encryptString($tokenData['access_token']),
            'refresh_token' => Crypt::encryptString($tokenData['refresh_token']),
            'expires_at' => now()->addSeconds($tokenData['expires_in'])->timestamp,
            'account_sid' => $accountSid,
            'connected_at' => now()->toIso8601String(),
        ];
        $settings['twilio_oauth_enabled'] = true;
        $tenant->settings = $settings;
        $tenant->save();

        activity()
            ->event('twilio_oauth_connected')
            ->performedOn($tenant)
            ->withProperties(['account_sid' => $accountSid])
            ->log('Twilio OAuth account connected');

        return redirect()->route('settings.tenant')
            ->with('success', 'Twilio account connected successfully.');
    }

    public function disconnect(Request $request)
    {
        $tenant = TenantModel::find($request->user()->tenant_id);
        $settings = $tenant->settings ?? [];
        $oauth = $settings['twilio_oauth'] ?? null;

        if ($oauth !== null) {
            try {
                $accessToken = Crypt::decryptString($oauth['access_token']);
                Http::asForm()->post(config('twilio-oauth.revoke_url'), [
                    'token' => $accessToken,
                ]);
            } catch (\Throwable) {
                // Best-effort revocation
            }
        }

        unset($settings['twilio_oauth']);
        $settings['twilio_oauth_enabled'] = false;
        $tenant->settings = $settings;
        $tenant->save();

        activity()
            ->event('twilio_oauth_disconnected')
            ->performedOn($tenant)
            ->log('Twilio OAuth account disconnected');

        return redirect()->route('settings.tenant')
            ->with('success', 'Twilio account disconnected.');
    }
}
```

- [ ] **Step 2:** Add routes to `routes/web.php`

```php
Route::get('/twilio/oauth/callback', [TwilioOAuthController::class, 'callback'])
    ->name('twilio.oauth.callback');
Route::post('/twilio/oauth/disconnect', [TwilioOAuthController::class, 'disconnect'])
    ->name('twilio.oauth.disconnect');
```

- [ ] **Step 3:** Commit

```bash
git add -A && git commit -m "feat(oauth): Twilio OAuth callback + disconnect handlers"
```

### Task 2.1.4: Connected status UI + replace manual fields

**Files:**
- Modify: `resources/js/Pages/Settings/Tenant.jsx`

**Interfaces:**
- Consumes: `twilioOAuthEnabled`, `twilioAccountSid`, `twilioConnectedAt` from Inertia props
- Produces: conditional UI (connected card vs manual fields)

- [ ] **Step 1:** Update Tenant.jsx Twilio section

Replace the Twilio section in `Tenant.jsx` with conditional rendering:

```jsx
{/* Twilio section */}
<div className="rounded-xl border border-zinc-950/5 bg-white p-8 dark:border-white/10 dark:bg-zinc-900">
    <div className="flex items-center gap-2">
        <Phone className="size-5 text-zinc-500" />
        <Subheading>Twilio</Subheading>
    </div>
    <Text className="mt-1">Configure your Twilio account for phone call handling.</Text>

    {tenant.twilio_oauth_enabled ? (
        <div className="mt-4 space-y-4">
            <div className="flex items-center gap-3 rounded-lg bg-emerald-50 p-4 dark:bg-emerald-900/20">
                <Badge color="emerald">Connected</Badge>
                <Text>Account {tenant.twilio_account_sid ?? 'connected'} — {tenant.twilio_connected_at ? new Date(tenant.twilio_connected_at).toLocaleDateString() : ''}</Text>
            </div>
            <Button outline onClick={() => router.post('/twilio/oauth/disconnect')}>
                Disconnect
            </Button>
        </div>
    ) : (
        <div className="mt-4 space-y-4">
            <ConnectTwilioButton href={tenant.connectUrl} />
            {/* existing manual fields */}
        </div>
    )}
</div>
```

- [ ] **Step 2:** Commit

```bash
git add -A && git commit -m "feat(oauth): connected status UI for Twilio"
```

### Task 2.1.5: Token refresh service

**Files:**
- Create: `app/Services/TwilioOAuthService.php`

**Interfaces:**
- Consumes: `tenant.settings.twilio_oauth` (encrypted tokens)
- Produces: valid access token string

- [ ] **Step 1:** Create service

```php
<?php
// app/Services/TwilioOAuthService.php
namespace App\Services;

use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TwilioOAuthService
{
    public function getValidAccessToken(TenantModel $tenant): ?string
    {
        $oauth = $tenant->settings['twilio_oauth'] ?? null;
        if ($oauth === null) {
            return null;
        }

        // Check if token expires within 5 minutes
        if (($oauth['expires_at'] ?? 0) - 300 > now()->timestamp) {
            return Crypt::decryptString($oauth['access_token']);
        }

        // Refresh
        $response = Http::asForm()->post(config('twilio-oauth.token_url'), [
            'client_id' => config('twilio-oauth.client_id'),
            'client_secret' => config('twilio-oauth.client_secret'),
            'grant_type' => 'refresh_token',
            'refresh_token' => Crypt::decryptString($oauth['refresh_token']),
        ]);

        if (! $response->successful()) {
            Log::warning('Twilio OAuth refresh failed', [
                'tenant_id' => $tenant->id,
                'status' => $response->status(),
            ]);

            // Mark disconnected
            $settings = $tenant->settings;
            unset($settings['twilio_oauth']);
            $settings['twilio_oauth_enabled'] = false;
            $tenant->settings = $settings;
            $tenant->save();

            return null;
        }

        $data = $response->json();
        $oauth['access_token'] = Crypt::encryptString($data['access_token']);
        $oauth['expires_at'] = now()->addSeconds($data['expires_in'])->timestamp;
        if (isset($data['refresh_token'])) {
            $oauth['refresh_token'] = Crypt::encryptString($data['refresh_token']);
        }

        $settings = $tenant->settings;
        $settings['twilio_oauth'] = $oauth;
        $tenant->settings = $settings;
        $tenant->save();

        return $data['access_token'];
    }
}
```

- [ ] **Step 2:** Register in AppServiceProvider as singleton

- [ ] **Step 3:** Commit

```bash
git add -A && git commit -m "feat(oauth): TwilioOAuthService with token refresh"
```

### Task 2.1.6: Tests

**Files:**
- Create: `tests/Feature/Web/TwilioOAuthControllerTest.php`

**Interfaces:**
- Consumes: all Sprint 2.1 code
- Produces: test coverage for OAuth flow

- [ ] **Step 1:** Write tests

```php
<?php
// tests/Feature/Web/TwilioOAuthControllerTest.php
namespace Tests\Feature\Web;

use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class TwilioOAuthControllerTest extends TestCase
{
    use RefreshDatabase;

    private TenantModel $tenant;
    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->tenant = TenantModel::create(['name' => 'Test', 'slug' => 'test']);
        $this->user = User::factory()->create(['tenant_id' => $this->tenant->id, 'role' => 'owner']);
    }

    public function test_callback_stores_credentials_on_valid_exchange(): void
    {
        Http::fake([
            'oauth.twilio.com/v2/token' => Http::response([
                'access_token' => 'at_xxx',
                'refresh_token' => 'rt_xxx',
                'expires_in' => 3600,
                'token_type' => 'Bearer',
            ]),
            'api.twilio.com/2010-04-01/Accounts/me.json' => Http::response([
                'sid' => 'AC1234567890',
            ]),
        ]);

        $state = Crypt::encryptString(json_encode([
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->user->id,
            'created_at' => now()->timestamp,
        ]));

        $this->actingAs($this->user)
            ->get(route('twilio.oauth.callback', ['code' => 'auth_code_xxx', 'state' => $state]))
            ->assertRedirect(route('settings.tenant'))
            ->assertSessionHas('success');

        $this->tenant->refresh();
        $this->assertTrue($this->tenant->settings['twilio_oauth_enabled']);
        $this->assertArrayHasKey('twilio_oauth', $this->tenant->settings);
    }

    public function test_callback_with_invalid_state_redirects_with_error(): void
    {
        $this->actingAs($this->user)
            ->get(route('twilio.oauth.callback', ['code' => 'x', 'state' => 'invalid']))
            ->assertRedirect(route('settings.tenant'))
            ->assertSessionHas('error');
    }

    public function test_callback_with_failed_token_exchange_redirects_with_error(): void
    {
        Http::fake([
            'oauth.twilio.com/v2/token' => Http::response(['error' => 'invalid_grant'], 400),
        ]);

        $state = Crypt::encryptString(json_encode([
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->user->id,
            'created_at' => now()->timestamp,
        ]));

        $this->actingAs($this->user)
            ->get(route('twilio.oauth.callback', ['code' => 'bad', 'state' => $state]))
            ->assertSessionHas('error');
    }

    public function test_disconnect_clears_credentials(): void
    {
        Http::fake();
        $this->tenant->settings = [
            'twilio_oauth_enabled' => true,
            'twilio_oauth' => [
                'access_token' => Crypt::encryptString('at_xxx'),
                'refresh_token' => Crypt::encryptString('rt_xxx'),
                'expires_at' => now()->addHour()->timestamp,
                'account_sid' => 'AC123',
            ],
        ];
        $this->tenant->save();

        $this->actingAs($this->user)
            ->post(route('twilio.oauth.disconnect'))
            ->assertRedirect(route('settings.tenant'));

        $this->tenant->refresh();
        $this->assertFalse($this->tenant->settings['twilio_oauth_enabled'] ?? false);
    }

    public function test_non_owner_cannot_connect(): void
    {
        $member = User::factory()->create(['tenant_id' => $this->tenant->id, 'role' => 'member']);
        $state = Crypt::encryptString(json_encode([
            'tenant_id' => $this->tenant->id,
            'user_id' => $member->id,
            'created_at' => now()->timestamp,
        ]));

        $this->actingAs($member)
            ->get(route('twilio.oauth.callback', ['code' => 'x', 'state' => $state]))
            ->assertForbidden();
    }
}
```

- [ ] **Step 2:** Run tests

```bash
php artisan test --compact --filter=TwilioOAuthControllerTest
```

- [ ] **Step 3:** Commit

```bash
git add -A && git commit -m "test(oauth): TwilioOAuthController tests"
```

---

## Sprint 2.2: ElevenLabs Credential Manager — 17 pts

### Task 2.2.1: Encrypted storage for elevenlabs_api_key

**Files:**
- Modify: `app/Infrastructure/Persistence/Eloquent/Tenant/TenantModel.php`

**Interfaces:**
- Consumes: existing `settings` JSON column
- Produces: `$tenant->elevenlabs_api_key` returns decrypted value

- [ ] **Step 1:** Add accessor + encrypted storage

In `TenantModel.php`, add:

```php
public function getElevenLabsApiKeyAttribute(): ?string
{
    $key = $this->settings['elevenlabs_api_key'] ?? null;
    if ($key === null) {
        return null;
    }
    try {
        return Crypt::decryptString($key);
    } catch (\Throwable) {
        return null;
    }
}

public function setElevenLabsApiKey(?string $value): void
{
    $settings = $this->settings ?? [];
    if ($value !== null && $value !== '') {
        $settings['elevenlabs_api_key'] = Crypt::encryptString($value);
    } else {
        unset($settings['elevenlabs_api_key']);
    }
    $this->settings = $settings;
}
```

- [ ] **Step 2:** Add import

```php
use Illuminate\Support\Facades\Crypt;
```

- [ ] **Step 3:** Commit

```bash
git add -A && git commit -m "feat(credential-manager): encrypted ElevenLabs API key storage"
```

### Task 2.2.2: ElevenLabs Connect controller

**Files:**
- Create: `app/Http/Controllers/Web/ElevenLabsConnectController.php`
- Modify: `routes/web.php` (add connect/status routes)

**Interfaces:**
- Consumes: `xi-api-key` header → ElevenLabs API
- Produces: `tenant.settings.elevenlabs_*` fields

- [ ] **Step 1:** Create controller

```php
<?php
// app/Http/Controllers/Web/ElevenLabsConnectController.php
namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ElevenLabsConnectController extends Controller
{
    public function connect(Request $request): JsonResponse
    {
        $request->validate([
            'api_key' => 'required|string|min:20',
        ]);

        $apiKey = $request->input('api_key');

        $userResponse = Http::withHeaders(['xi-api-key' => $apiKey])
            ->timeout(10)
            ->get('https://api.elevenlabs.io/v1/user');

        if ($userResponse->status() === 401) {
            return response()->json([
                'success' => false,
                'error' => 'Invalid API key. Please check and try again.',
            ], 422);
        }

        if (! $userResponse->successful()) {
            return response()->json([
                'success' => false,
                'error' => 'Could not connect to ElevenLabs. Please try again.',
            ], 422);
        }

        $userData = $userResponse->json();

        $subResponse = Http::withHeaders(['xi-api-key' => $apiKey])
            ->timeout(10)
            ->get('https://api.elevenlabs.io/v1/user/subscription');

        $subData = $subResponse->json() ?? [];

        $tenant = TenantModel::find($request->user()->tenant_id);
        $settings = $tenant->settings ?? [];
        $settings['elevenlabs_api_key'] = \Illuminate\Support\Facades\Crypt::encryptString($apiKey);
        $settings['elevenlabs_account_id'] = $userData['subscription']['tier'] ?? null;
        $settings['elevenlabs_subscription_tier'] = $subData['tier'] ?? 'unknown';
        $settings['elevenlabs_character_count'] = $subData['character_count'] ?? 0;
        $settings['elevenlabs_character_limit'] = $subData['character_limit'] ?? 0;
        $settings['elevenlabs_connected_at'] = now()->toIso8601String();
        $settings['elevenlabs_health_status'] = null;
        $tenant->settings = $settings;
        $tenant->save();

        activity()
            ->event('elevenlabs_connected')
            ->performedOn($tenant)
            ->withProperties(['account_id' => $userData['xi_api_key_preview'] ?? null])
            ->log('ElevenLabs account connected');

        return response()->json([
            'success' => true,
            'account' => [
                'user_id' => $userData['xi_api_key_preview'] ?? null,
                'tier' => $subData['tier'] ?? 'unknown',
                'character_count' => $subData['character_count'] ?? 0,
                'character_limit' => $subData['character_limit'] ?? 0,
            ],
        ]);
    }

    public function status(Request $request): JsonResponse
    {
        $tenant = TenantModel::find($request->user()->tenant_id);
        $settings = $tenant->settings ?? [];

        if (! isset($settings['elevenlabs_api_key'])) {
            return response()->json(['connected' => false]);
        }

        return response()->json([
            'connected' => true,
            'account' => [
                'tier' => $settings['elevenlabs_subscription_tier'] ?? 'unknown',
                'character_count' => $settings['elevenlabs_character_count'] ?? 0,
                'character_limit' => $settings['elevenlabs_character_limit'] ?? 0,
                'connected_at' => $settings['elevenlabs_connected_at'] ?? null,
                'health_status' => $settings['elevenlabs_health_status'] ?? null,
            ],
        ]);
    }
}
```

- [ ] **Step 2:** Add routes

```php
Route::post('/settings/elevenlabs/connect', [ElevenLabsConnectController::class, 'connect'])
    ->name('settings.elevenlabs.connect');
Route::get('/settings/elevenlabs/status', [ElevenLabsConnectController::class, 'status'])
    ->name('settings.elevenlabs.status');
```

- [ ] **Step 3:** Commit

```bash
git add -A && git commit -m "feat(credential-manager): ElevenLabs connect controller + routes"
```

### Task 2.2.3: Connect modal + account info UI

**Files:**
- Create: `resources/js/Components/ElevenLabsConnectModal.jsx`
- Modify: `resources/js/Pages/Settings/Tenant.jsx` (replace ElevenLabs section)

**Interfaces:**
- Consumes: `connect()` POST endpoint, `status()` GET endpoint
- Produces: connected state display + character usage bar

- [ ] **Step 1:** Create modal component

```jsx
// resources/js/Components/ElevenLabsConnectModal.jsx
import { Dialog, DialogTitle, DialogBody, DialogActions } from '@/Components/catalyst/dialog';
import { Button } from '@/Components/catalyst/button';
import { Field, Label, ErrorMessage } from '@/Components/catalyst/fieldset';
import { Input } from '@/Components/catalyst/input';
import { Text } from '@/Components/catalyst/text';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function ElevenLabsConnectModal({ open, onClose, onConnected }) {
    const [apiKey, setApiKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleConnect() {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/settings/elevenlabs/connect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ api_key: apiKey }),
            });
            const data = await res.json();
            if (data.success) {
                onConnected(data.account);
                onClose();
            } else {
                setError(data.error || 'Connection failed.');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Connect ElevenLabs</DialogTitle>
            <DialogBody>
                <Text>Enter your ElevenLabs API key to connect your account.</Text>
                <Field className="mt-4">
                    <Label>API Key</Label>
                    <div className="relative">
                        <Input
                            type={showKey ? 'text' : 'password'}
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Enter your API key"
                        />
                        <button
                            type="button"
                            onClick={() => setShowKey(!showKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
                        >
                            {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                    </div>
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                </Field>
            </DialogBody>
            <DialogActions>
                <Button outline onClick={onClose}>Cancel</Button>
                <Button onClick={handleConnect} disabled={loading || apiKey.length < 20}>
                    {loading ? <Loader2 className="size-4 animate-spin" /> : 'Test & Connect'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
```

- [ ] **Step 2:** Update Tenant.jsx ElevenLabs section

Replace the ElevenLabs section with connected/disconnected state + modal trigger:

```jsx
{tenant.elevenlabs_connected_at ? (
    <div className="mt-4 space-y-4">
        <div className="flex items-center gap-3 rounded-lg bg-emerald-50 p-4 dark:bg-emerald-900/20">
            <Badge color="emerald">Connected</Badge>
            <Text>Tier: {tenant.elevenlabs_subscription_tier ?? 'unknown'}</Text>
        </div>
        <div className="w-full bg-zinc-200 rounded-full h-2 dark:bg-zinc-700">
            <div
                className="bg-indigo-500 h-2 rounded-full"
                style={{ width: `${Math.min(100, ((tenant.elevenlabs_character_count ?? 0) / (tenant.elevenlabs_character_limit ?? 1)) * 100)}%` }}
            />
        </div>
        <Text>{tenant.elevenlabs_character_count ?? 0} / {tenant.elevenlabs_character_limit ?? 0} characters used</Text>
        <Button outline onClick={() => setShowElevenLabsModal(true)}>Reconnect</Button>
    </div>
) : (
    <Button outline onClick={() => setShowElevenLabsModal(true)}>Connect ElevenLabs</Button>
)}
```

- [ ] **Step 3:** Commit

```bash
git add -A && git commit -m "feat(credential-manager): ElevenLabs connect modal + account UI"
```

### Task 2.2.4: Health check cron

**Files:**
- Create: `app/Console/Commands/ElevenLabsHealthCheck.php`
- Create: `app/Notifications/ElevenLabsKeyInvalid.php`
- Modify: `routes/console.php` (add schedule)

**Interfaces:**
- Consumes: all tenants with elevenlabs_api_key set
- Produces: health_status updates + notifications

- [ ] **Step 1:** Create command

```php
<?php
// app/Console/Commands/ElevenLabsHealthCheck.php
namespace App\Console\Commands;

use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Models\User;
use App\Notifications\ElevenLabsKeyInvalid;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ElevenLabsHealthCheck extends Command
{
    protected $signature = 'elevenlabs:health-check';
    protected $description = 'Check health of all connected ElevenLabs API keys';

    public function handle(): int
    {
        $tenants = TenantModel::whereNotNull('settings->elevenlabs_api_key')->get();

        foreach ($tenants as $tenant) {
            try {
                $apiKey = Crypt::decryptString($tenant->settings['elevenlabs_api_key']);

                $response = Http::withHeaders(['xi-api-key' => $apiKey])
                    ->timeout(10)
                    ->get('https://api.elevenlabs.io/v1/user');

                if ($response->status() === 401) {
                    $settings = $tenant->settings;
                    $settings['elevenlabs_health_status'] = 'invalid';
                    $tenant->settings = $settings;
                    $tenant->save();

                    $owner = User::where('tenant_id', $tenant->id)->where('role', 'owner')->first();
                    if ($owner !== null) {
                        $owner->notify(new ElevenLabsKeyInvalid($tenant->name));
                    }

                    activity()
                        ->event('elevenlabs_key_invalid')
                        ->performedOn($tenant)
                        ->log('ElevenLabs API key is invalid');

                    $this->warn("Invalid key for tenant: {$tenant->name}");
                } elseif ($response->successful()) {
                    $subResponse = Http::withHeaders(['xi-api-key' => $apiKey])
                        ->timeout(10)
                        ->get('https://api.elevenlabs.io/v1/user/subscription');

                    $subData = $subResponse->json() ?? [];
                    $settings = $tenant->settings;
                    $settings['elevenlabs_character_count'] = $subData['character_count'] ?? 0;
                    $settings['elevenlabs_character_limit'] = $subData['character_limit'] ?? 0;
                    $settings['elevenlabs_subscription_tier'] = $subData['tier'] ?? 'unknown';
                    $settings['elevenlabs_health_status'] = null;
                    $tenant->settings = $settings;
                    $tenant->save();
                }
            } catch (\Throwable $e) {
                Log::warning('ElevenLabs health check failed', [
                    'tenant_id' => $tenant->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->info("Checked {$tenants->count()} ElevenLabs connections.");
        return self::SUCCESS;
    }
}
```

- [ ] **Step 2:** Create notification

```php
<?php
// app/Notifications/ElevenLabsKeyInvalid.php
namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ElevenLabsKeyInvalid extends Notification
{
    use Queueable;

    public function __construct(private readonly string $tenantName) {}

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('ElevenLabs API key needs attention')
            ->greeting("Hi {$notifiable->name},")
            ->line("Your ElevenLabs API key for {$this->tenantName} is no longer valid.")
            ->line('Please reconnect in Settings > ElevenLabs to restore voice synthesis.')
            ->action('Reconnect', url('/settings/tenant'));
    }
}
```

- [ ] **Step 3:** Add schedule in `routes/console.php`

```php
$schedule->command('elevenlabs:health-check')->weekly();
```

- [ ] **Step 4:** Commit

```bash
git add -A && git commit -m "feat(credential-manager): ElevenLabs health check cron + notification"
```

### Task 2.2.5: Key rotation from UI

**Files:**
- Modify: `resources/js/Components/ElevenLabsConnectModal.jsx` (support reconnect mode)
- Modify: `resources/js/Pages/Settings/Tenant.jsx` (reconnect button)

**Interfaces:**
- Consumes: same `connect()` endpoint (overwrites existing)
- Produces: activity_log event `elevenlabs_key_rotated`

- [ ] **Step 1:** Add title prop to modal

```jsx
// In ElevenLabsConnectModal.jsx, change DialogTitle:
<DialogTitle>{reconnect ? 'Update ElevenLabs API Key' : 'Connect ElevenLabs'}</DialogTitle>
```

- [ ] **Step 2:** Add reconnect button to Tenant.jsx

When connected, show "Reconnect" button that opens modal in reconnect mode.

- [ ] **Step 3:** Log rotation in controller

In `ElevenLabsConnectController@connect`, if existing key exists, log `elevenlabs_key_rotated` instead of `elevenlabs_connected`.

- [ ] **Step 4:** Commit

```bash
git add -A && git commit -m "feat(credential-manager): ElevenLabs key rotation from UI"
```

### Task 2.2.6: Tests

**Files:**
- Create: `tests/Feature/Web/ElevenLabsConnectControllerTest.php`
- Create: `tests/Feature/Commands/ElevenLabsHealthCheckTest.php`

**Interfaces:**
- Consumes: all Sprint 2.2 code
- Produces: test coverage

- [ ] **Step 1:** Write connect controller tests

```php
<?php
// tests/Feature/Web/ElevenLabsConnectControllerTest.php
namespace Tests\Feature\Web;

use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ElevenLabsConnectControllerTest extends TestCase
{
    use RefreshDatabase;

    private TenantModel $tenant;
    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->tenant = TenantModel::create(['name' => 'Test', 'slug' => 'test']);
        $this->user = User::factory()->create(['tenant_id' => $this->tenant->id, 'role' => 'owner']);
    }

    public function test_connect_with_valid_key_saves_credentials(): void
    {
        Http::fake([
            'api.elevenlabs.io/v1/user' => Http::response([
                'xi_api_key_preview' => 'sk-xxxx',
            ]),
            'api.elevenlabs.io/v1/user/subscription' => Http::response([
                'tier' => 'creator',
                'character_count' => 5000,
                'character_limit' => 30000,
            ]),
        ]);

        $this->actingAs($this->user)
            ->postJson('/settings/elevenlabs/connect', ['api_key' => str_repeat('x', 20)])
            ->assertOk()
            ->assertJson(['success' => true]);

        $this->tenant->refresh();
        $this->assertArrayHasKey('elevenlabs_api_key', $this->tenant->settings);
    }

    public function test_connect_with_invalid_key_returns_422(): void
    {
        Http::fake([
            'api.elevenlabs.io/v1/user' => Http::response([], 401),
        ]);

        $this->actingAs($this->user)
            ->postJson('/settings/elevenlabs/connect', ['api_key' => str_repeat('x', 20)])
            ->assertStatus(422)
            ->assertJson(['success' => false]);
    }

    public function test_status_returns_account_info(): void
    {
        $this->tenant->settings = [
            'elevenlabs_api_key' => Crypt::encryptString('test-key'),
            'elevenlabs_subscription_tier' => 'creator',
            'elevenlabs_character_count' => 5000,
            'elevenlabs_character_limit' => 30000,
        ];
        $this->tenant->save();

        $this->actingAs($this->user)
            ->getJson('/settings/elevenlabs/status')
            ->assertOk()
            ->assertJson(['connected' => true]);
    }

    public function test_status_returns_disconnected_when_no_key(): void
    {
        $this->actingAs($this->user)
            ->getJson('/settings/elevenlabs/status')
            ->assertOk()
            ->assertJson(['connected' => false]);
    }

    public function test_non_owner_cannot_connect(): void
    {
        $member = User::factory()->create(['tenant_id' => $this->tenant->id, 'role' => 'member']);

        $this->actingAs($member)
            ->postJson('/settings/elevenlabs/connect', ['api_key' => str_repeat('x', 20)])
            ->assertForbidden();
    }
}
```

- [ ] **Step 2:** Write health check tests

```php
<?php
// tests/Feature/Commands/ElevenLabsHealthCheckTest.php
namespace Tests\Feature\Commands;

use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Models\User;
use App\Notifications\ElevenLabsKeyInvalid;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class ElevenLabsHealthCheckTest extends TestCase
{
    use RefreshDatabase;

    public function test_health_check_updates_character_counts(): void
    {
        $tenant = TenantModel::create(['name' => 'Test', 'slug' => 'test']);
        $tenant->settings = [
            'elevenlabs_api_key' => Crypt::encryptString('valid-key'),
        ];
        $tenant->save();

        Http::fake([
            'api.elevenlabs.io/v1/user' => Http::response(['ok' => true]),
            'api.elevenlabs.io/v1/user/subscription' => Http::response([
                'tier' => 'pro',
                'character_count' => 10000,
                'character_limit' => 50000,
            ]),
        ]);

        $this->artisan('elevenlabs:health-check')->assertExitCode(0);

        $tenant->refresh();
        $this->assertEquals(10000, $tenant->settings['elevenlabs_character_count']);
        $this->assertEquals('pro', $tenant->settings['elevenlabs_subscription_tier']);
    }

    public function test_health_check_invalid_key_sends_notification(): void
    {
        Notification::fake();
        $tenant = TenantModel::create(['name' => 'Test', 'slug' => 'test']);
        $user = User::factory()->create(['tenant_id' => $tenant->id, 'role' => 'owner']);
        $tenant->settings = [
            'elevenlabs_api_key' => Crypt::encryptString('invalid-key'),
        ];
        $tenant->save();

        Http::fake([
            'api.elevenlabs.io/v1/user' => Http::response([], 401),
        ]);

        $this->artisan('elevenlabs:health-check')->assertExitCode(0);

        Notification::assertSentTo($user, ElevenLabsKeyInvalid::class);

        $tenant->refresh();
        $this->assertEquals('invalid', $tenant->settings['elevenlabs_health_status']);
    }

    public function test_health_check_no_tenants_is_noop(): void
    {
        $this->artisan('elevenlabs:health-check')->assertExitCode(0);
    }
}
```

- [ ] **Step 3:** Run all tests

```bash
php artisan test --compact --filter="ElevenLabsConnectControllerTest|ElevenLabsHealthCheckTest"
```

- [ ] **Step 4:** Full QA

```bash
vendor/bin/pint --format agent && composer phpstan && pnpm run build
```

- [ ] **Step 5:** Commit

```bash
git add -A && git commit -m "test(credential-manager): ElevenLabs connect + health check tests"
```

---

## Final QA

After all tasks:

```bash
php artisan test --compact
vendor/bin/pint --format agent
composer phpstan
pnpm run build
php artisan wayfinder:generate
```
