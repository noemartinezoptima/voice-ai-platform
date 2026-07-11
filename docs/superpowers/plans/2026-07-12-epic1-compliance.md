# Epic 1: Compliance Framework — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans.

**Goal:** Implement GDPR/CCPA compliance: data protection settings, IVR consent disclosure, data lifecycle management, and privacy dashboard.

**Tech Stack:** Laravel 13, Twilio TwiML `<Gather>`, spatie/laravel-activitylog, Laravel encrypted casts

**Architecture:** Tenant-level JSON `data_protection` column drives IVR consent and retention. Twilio webhook delegates to consent callback before flow execution. Data lifecycle runs via scheduled Artisan commands. Privacy dashboard reads from activity_log + aggregated data.

## Global Constraints

- API Key `elevenlabs_api_key` may end up in logs or error messages — ensure the encrypted cast is in place before any error handling references the value.
- All Twilio webhook routes use `twilio.verify` middleware (except SMS which uses `throttle:twilio`).
- Activity log uses `activity()` helper with `event()` and `withProperties()`.
- Laravel `'encrypted'` cast requires TEXT column (encrypted values exceed VARCHAR).
- All UI pages must use Catalyst components (Heading, Text, Button, Input, Badge, Table, etc.).
- Every controller method must handle authorization via existing `Gate::allows('viewSettings', ...)` or tenant-owner check.

---

## Sprint 1: Data Protection Settings + IVR Consent (13 pts)

### Task 1.1: Migration for `data_protection` JSON column

**Files:**
- Create: `database/migrations/xxxx_07_12_000001_add_data_protection_to_tenants_table.php`
- Modify: `app/Infrastructure/Persistence/Eloquent/Tenant/TenantModel.php`

**Interfaces:**
- Consumes: `TenantModel` exists with `casts()` method
- Produces: `$tenant->data_protection` returns array with keys `consent_required`, `retention_days`, `consent_message`, `consent_recordings`, `consent_transcripts`

- [ ] **Step 1:** Generate migration

```bash
php artisan make:migration add_data_protection_to_tenants_table --table=tenants
```

- [ ] **Step 2:** Write migration

```php
public function up(): void
{
    Schema::table('tenants', function (Blueprint $table) {
        $table->json('data_protection')->nullable()->after('settings');
    });
}

public function down(): void
{
    Schema::table('tenants', function (Blueprint $table) {
        $table->dropColumn('data_protection');
    });
}
```

- [ ] **Step 3:** Add cast to TenantModel

In `app/Infrastructure/Persistence/Eloquent/Tenant/TenantModel.php`, add to `casts()`:

```php
protected function casts(): array
{
    return [
        ...parent::casts(),
        'data_protection' => 'array',
    ];
}
```

- [ ] **Step 4:** Add default accessor helper on TenantModel

```php
public function getDataProtectionAttribute(?string $value): array
{
    return array_merge([
        'consent_required' => false,
        'retention_days' => 90,
        'consent_message' => 'This call may be recorded for quality and training purposes. By continuing, you consent to recording.',
        'consent_recordings' => true,
        'consent_transcripts' => true,
    ], json_decode($value ?? '{}', true));
}
```

- [ ] **Step 5:** Run migration

```bash
php artisan migrate
```

- [ ] **Step 6:** Commit

```bash
git add database/migrations/ app/Infrastructure/Persistence/Eloquent/Tenant/TenantModel.php
git commit -m "feat(compliance): add data_protection JSON column to tenants"
```

---

### Task 1.2: DataProtectionController + Routes

**Files:**
- Create: `app/Http/Controllers/Web/DataProtectionController.php`
- Modify: `routes/web.php`

**Interfaces:**
- Consumes: `TenantRepositoryInterface`, `$request->user()->tenant_id`
- Produces: `GET /settings/data-protection` returns Inertia page, `PATCH /settings/data-protection` updates column

- [ ] **Step 1:** Create controller

```php
<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Domain\Tenant\Repositories\TenantRepositoryInterface;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DataProtectionController extends Controller
{
    public function __construct(
        private readonly TenantRepositoryInterface $tenantRepository,
    ) {}

    public function edit(Request $request): Response
    {
        $tenantId = $request->user()->tenant_id;
        $tenant = $this->tenantRepository->findById($tenantId);

        return Inertia::render('Settings/DataProtection/Index', [
            'dataProtection' => $tenant->getDataProtection(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $tenantId = $request->user()->tenant_id;
        $tenant = $this->tenantRepository->findById($tenantId);

        $validated = $request->validate([
            'consent_required' => 'boolean',
            'retention_days' => 'required|integer|in:30,60,90,180,365',
            'consent_message' => 'required_if:consent_required,true|string|max:500',
            'consent_recordings' => 'boolean',
            'consent_transcripts' => 'boolean',
        ]);

        $tenantModel = \App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel::find($tenantId);
        $dataProtection = $tenantModel->data_protection ?? [];
        $tenantModel->data_protection = array_merge($dataProtection, $validated);
        $tenantModel->save();

        activity()
            ->performedOn($tenantModel)
            ->event('data_protection_updated')
            ->log('Data protection settings updated');

        return redirect()->route('settings.data-protection')
            ->with('success', 'Data protection settings saved.');
    }
}
```

- [ ] **Step 2:** Register routes

In `routes/web.php`, inside the `Route::middleware('auth')->group(function () { ... })` block, add:

```php
Route::get('/settings/data-protection', [DataProtectionController::class, 'edit'])
    ->name('settings.data-protection');
Route::patch('/settings/data-protection', [DataProtectionController::class, 'update'])
    ->name('settings.data-protection.update');
```

- [ ] **Step 3:** Run Wayfinder to generate frontend route helpers

```bash
php artisan wayfinder:generate
```

- [ ] **Step 4:** Commit

```bash
git add app/Http/Controllers/Web/DataProtectionController.php routes/web.php
git commit -m "feat(compliance): data protection controller and routes"
```

---

### Task 1.3: Settings/DataProtection React Page

**Files:**
- Create: `resources/js/Pages/Settings/DataProtection/Index.jsx`

**Interfaces:**
- Consumes: `dataProtection` prop from Inertia
- Produces: form PATCH to `settings.data-protection.update`

- [ ] **Step 1:** Write the React page

```jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Heading, Subheading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Switch } from '@/Components/catalyst/switch';
import { Select } from '@/Components/catalyst/select';
import { Textarea } from '@/Components/catalyst/textarea';

export default function Index({ dataProtection }) {
    const { data, setData, patch, processing, errors } = useForm({
        consent_required: dataProtection.consent_required ?? false,
        retention_days: dataProtection.retention_days ?? 90,
        consent_message: dataProtection.consent_message ?? '',
        consent_recordings: dataProtection.consent_recordings ?? true,
        consent_transcripts: dataProtection.consent_transcripts ?? true,
    });

    function submit(e) {
        e.preventDefault();
        patch('/settings/data-protection', { preserveScroll: true });
    }

    return (
        <AuthenticatedLayout>
            <Head title="Data Protection" />

            <div className="flex items-end justify-between">
                <div>
                    <Heading>Data Protection</Heading>
                    <Text className="mt-1">Manage consent and data retention settings.</Text>
                </div>
            </div>

            <div className="mt-8 max-w-2xl">
                <form onSubmit={submit} className="space-y-6">
                    <div className="rounded-xl border border-zinc-950/5 bg-white p-8 dark:border-white/10 dark:bg-zinc-900">
                        <Subheading>Call Recording Consent</Subheading>

                        <div className="mt-4 flex items-center justify-between">
                            <div>
                                <Text className="font-medium">Require caller consent</Text>
                                <Text className="text-sm text-zinc-500">
                                    Play a disclosure message and require DTMF acceptance before recording.
                                </Text>
                            </div>
                            <Switch
                                checked={data.consent_required}
                                onChange={(checked) => setData('consent_required', checked)}
                            />
                        </div>

                        {data.consent_required && (
                            <>
                                <div className="mt-4">
                                    <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        Disclosure message
                                    </label>
                                    <Textarea
                                        value={data.consent_message}
                                        onChange={(e) => setData('consent_message', e.target.value)}
                                        rows={3}
                                    />
                                    {errors.consent_message && (
                                        <p className="mt-1 text-xs text-red-600">{errors.consent_message}</p>
                                    )}
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    <div>
                                        <Text className="font-medium">Apply consent to recordings</Text>
                                    </div>
                                    <Switch
                                        checked={data.consent_recordings}
                                        onChange={(checked) => setData('consent_recordings', checked)}
                                    />
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    <div>
                                        <Text className="font-medium">Apply consent to transcripts</Text>
                                    </div>
                                    <Switch
                                        checked={data.consent_transcripts}
                                        onChange={(checked) => setData('consent_transcripts', checked)}
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="rounded-xl border border-zinc-950/5 bg-white p-8 dark:border-white/10 dark:bg-zinc-900">
                        <Subheading>Data Retention</Subheading>

                        <div className="mt-4">
                            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Retention period
                            </label>
                            <Select
                                value={data.retention_days}
                                onChange={(e) => setData('retention_days', parseInt(e.target.value))}
                            >
                                <option value={30}>30 days</option>
                                <option value={60}>60 days</option>
                                <option value={90}>90 days</option>
                                <option value={180}>180 days</option>
                                <option value={365}>365 days</option>
                            </Select>
                            {errors.retention_days && (
                                <p className="mt-1 text-xs text-red-600">{errors.retention_days}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            Save Settings
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
```

- [ ] **Step 2:** Run Wayfinder to generate frontend route helpers

```bash
php artisan wayfinder:generate
```

- [ ] **Step 3:** Build frontend to verify no errors

```bash
pnpm run build
```

- [ ] **Step 4:** Commit

```bash
git add resources/js/Pages/Settings/DataProtection/Index.jsx
git commit -m "feat(compliance): DataProtection settings page"
```

---

### Task 1.4: IVR Consent Disclosure in Twilio Webhook

**Files:**
- Modify: `app/Http/Controllers/Twilio/WebhookController.php`
- Create: `app/Application/Call/UseCases/HandleConsentedCall.php` (or modify `HandleInboundCall`)
- Modify: `routes/web.php` (add consent-callback route)

**Interfaces:**
- Consumes: `TenantModel` with `data_protection` attribute, `InboundCallData::fromTwilio($request->all())`
- Produces: consent-gated TwiML response, consent callback endpoint

- [ ] **Step 1:** Modify `WebhookController@inbound` to check consent

Add a tenant lookup before the flow execution. The called number (`To`) identifies the tenant:

```php
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;

// At top of inbound method, after try {
$toNumber = $request->input('To');
$tenantModel = TenantModel::where('settings->twilio_phone_number', $toNumber)->first();

if ($tenantModel !== null) {
    $dp = $tenantModel->data_protection;
    if (($dp['consent_required'] ?? false)) {
        $response = new VoiceResponse;
        $gather = $response->gather([
            'action' => route('twilio.consent-callback'),
            'numDigits' => 1,
            'timeout' => 5,
        ]);
        $gather->say($dp['consent_message'] ?? 'This call may be recorded. Press 1 to consent.');
        $gather->say('Press 1 to accept, or any other key to decline.');
        $response->say('You did not provide consent. Goodbye.');
        $response->hangup();

        return $this->toResponse($response);
    }
}
```

Place this block BEFORE `$data = InboundCallData::fromTwilio($request->all())` — we don't want to create a call record until consent is obtained.

- [ ] **Step 2:** Add consent-callback method to WebhookController

```php
public function consentCallback(Request $request): Response
{
    $digits = $request->input('Digits');

    if ($digits === '1') {
        activity()
            ->event('consent_granted')
            ->withProperties([
                'caller' => $request->input('From'),
                'call_sid' => $request->input('CallSid'),
                'tenant' => $request->input('To'),
            ])
            ->log('Call recording consent granted');

        $data = InboundCallData::fromTwilio($request->all());
        $call = $this->handleInboundCall->execute($data);

        $flow = $this->flowRepository->findById($call->getFlowId() ?? '');

        if ($flow === null || !$flow->isActive()) {
            return $this->notConfigured();
        }

        $startStep = $flow->config()->startStep();

        return $this->toResponse($this->flowExecutor->executeStep($startStep, $flow, $call));
    }

    activity()
        ->event('consent_declined')
        ->withProperties([
            'caller' => $request->input('From'),
            'call_sid' => $request->input('CallSid'),
        ])
        ->log('Call recording consent declined');

    $response = new VoiceResponse;
    $response->say('Goodbye.');
    $response->hangup();

    return $this->toResponse($response);
}
```

- [ ] **Step 3:** Register the consent-callback route

In `routes/web.php`, add alongside other Twilio routes:

```php
Route::post('twilio/consent-callback', [WebhookController::class, 'consentCallback'])
    ->middleware('twilio.verify')
    ->name('twilio.consent-callback');
```

- [ ] **Step 4:** Commit

```bash
git add app/Http/Controllers/Twilio/WebhookController.php routes/web.php
git commit -m "feat(compliance): IVR consent disclosure in inbound webhook"
```

---

### Task 1.5: Consent Disclosure Tests

**Files:**
- Create: `tests/Feature/Twilio/ConsentDisclosureTest.php`

- [ ] **Step 1:** Write the test

```php
<?php

namespace Tests\Feature\Twilio;

use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Factories\TenantFactory;
use Tests\Factories\UserFactory;

class ConsentDisclosureTest extends TestCase
{
    use RefreshDatabase;

    private TenantModel $tenant;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = TenantFactory::new()->create();
        $this->tenant->data_protection = [
            'consent_required' => true,
            'retention_days' => 90,
            'consent_message' => 'This call may be recorded.',
            'consent_recordings' => true,
            'consent_transcripts' => true,
        ];
        $this->tenant->save();
    }

    public function test_inbound_call_with_consent_required_returns_gather_twiml(): void
    {
        $response = $this->post('twilio/inbound', [
            'CallSid' => 'CA' . str_repeat('0', 32),
            'From' => '+1234567890',
            'To' => $this->tenant->settings['twilio_phone_number'] ?? '+15551234567',
        ]);

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/xml');
        $content = $response->getContent();

        $this->assertStringContainsString('<Gather', $content);
        $this->assertStringContainsString('This call may be recorded.', $content);
        $this->assertStringContainsString('<Hangup', $content);
    }

    public function test_inbound_call_without_consent_required_skips_gather(): void
    {
        $this->tenant->data_protection = array_merge(
            $this->tenant->data_protection ?? [],
            ['consent_required' => false]
        );
        $this->tenant->save();

        $response = $this->post('twilio/inbound', [
            'CallSid' => 'CA' . str_repeat('1', 32),
            'From' => '+1234567890',
            'To' => $this->tenant->settings['twilio_phone_number'] ?? '+15551234567',
        ]);

        $content = $response->getContent();
        $this->assertStringNotContainsString('<Gather', $content);
    }

    public function test_consent_callback_with_digit_1_proceeds_to_flow(): void
    {
        $response = $this->post('twilio/consent-callback', [
            'CallSid' => 'CA' . str_repeat('2', 32),
            'From' => '+1234567890',
            'To' => $this->tenant->settings['twilio_phone_number'] ?? '+15551234567',
            'Digits' => '1',
        ]);

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/xml');

        $this->assertDatabaseHas('activity_log', [
            'event' => 'consent_granted',
        ]);
    }

    public function test_consent_callback_with_other_digit_hangs_up(): void
    {
        $response = $this->post('twilio/consent-callback', [
            'CallSid' => 'CA' . str_repeat('3', 32),
            'From' => '+1234567890',
            'To' => $this->tenant->settings['twilio_phone_number'] ?? '+15551234567',
            'Digits' => '2',
        ]);

        $response->assertStatus(200);
        $content = $response->getContent();
        $this->assertStringContainsString('Goodbye', $content);
        $this->assertStringContainsString('<Hangup', $content);

        $this->assertDatabaseHas('activity_log', [
            'event' => 'consent_declined',
        ]);
    }

    public function test_empty_data_protection_uses_defaults(): void
    {
        $this->tenant->data_protection = null;
        $this->tenant->save();

        $response = $this->post('twilio/inbound', [
            'CallSid' => 'CA' . str_repeat('4', 32),
            'From' => '+1234567890',
            'To' => $this->tenant->settings['twilio_phone_number'] ?? '+15551234567',
        ]);

        $content = $response->getContent();
        $this->assertStringNotContainsString('<Gather', $content);
    }
}
```

- [ ] **Step 2:** Run test

```bash
php artisan test --compact --filter=ConsentDisclosureTest
```

Expected: PASS

- [ ] **Step 3:** Run DataProtectionPageTest

```bash
php artisan test --compact --filter=DataProtectionPageTest
```

- [ ] **Step 4:** Commit

```bash
git add tests/Feature/Twilio/ConsentDisclosureTest.php
git commit -m "feat(compliance): consent disclosure tests"
```

---

## Sprint 2: Data Lifecycle (13 pts)

### Task 2.1: `data:purge-expired` Command

**Files:**
- Create: `app/Console/Commands/PurgeExpiredData.php`
- Modify: `routes/console.php`

- [ ] **Step 1:** Generate command

```bash
php artisan make:command PurgeExpiredData
```

- [ ] **Step 2:** Write command

```php
<?php

namespace App\Console\Commands;

use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class PurgeExpiredData extends Command
{
    protected $signature = 'data:purge-expired';
    protected $description = 'Purge recordings and call logs exceeding tenant retention period';

    public function handle(): int
    {
        $tenants = TenantModel::whereNotNull('data_protection')->get();
        $totalDeleted = 0;

        foreach ($tenants as $tenant) {
            $dp = $tenant->data_protection;
            $retentionDays = $dp['retention_days'] ?? 90;

            if ($retentionDays <= 0) {
                continue;
            }

            $cutoff = Carbon::now()->subDays($retentionDays);

            // Purge old calls (soft-check via call_logs or calls table)
            // This queries the calls table directly based on created_at
            $deletedCount = \DB::table('calls')
                ->where('tenant_id', $tenant->id)
                ->where('created_at', '<', $cutoff)
                ->delete();

            // Delete recording files from storage
            // Recordings are stored by call SID
            $recordingFiles = Storage::disk('recordings')->files($tenant->id);
            $deletedRecordings = 0;

            foreach ($recordingFiles as $file) {
                $fileTime = Storage::disk('recordings')->lastModified($file);

                if ($fileTime < $cutoff->timestamp) {
                    Storage::disk('recordings')->delete($file);
                    $deletedRecordings++;
                }
            }

            if ($deletedCount > 0 || $deletedRecordings > 0) {
                activity()
                    ->event('data_purged')
                    ->withProperties([
                        'tenant_id' => $tenant->id,
                        'deleted_calls' => $deletedCount,
                        'deleted_recordings' => $deletedRecordings,
                        'retention_days' => $retentionDays,
                    ])
                    ->log('Expired data purged');

                $totalDeleted += $deletedCount + $deletedRecordings;

                $this->info("Tenant {$tenant->id}: {$deletedCount} calls, {$deletedRecordings} recordings purged");
            }
        }

        $this->info("Total: {$totalDeleted} records purged");

        return Command::SUCCESS;
    }
}
```

- [ ] **Step 3:** Add schedule

In `routes/console.php`:

```php
Schedule::command('data:purge-expired')->daily()->at('03:00');
```

- [ ] **Step 4:** Commit

```bash
git add app/Console/Commands/PurgeExpiredData.php routes/console.php
git commit -m "feat(compliance): data purge command with schedule"
```

---

### Task 2.2: Right to Be Forgotten Endpoint

**Files:**
- Create: `app/Http/Controllers/Api/DataDeletionController.php`
- Modify: `routes/web.php` (or create `routes/api.php`)

- [ ] **Step 1:** Create controller

```php
<?php

namespace App\Http\Controllers\Api;

use App\Domain\Tenant\Repositories\TenantRepositoryInterface;
use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DataDeletionController extends Controller
{
    public function __construct(
        private readonly TenantRepositoryInterface $tenantRepository,
    ) {}

    public function destroy(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;

        if (!$request->user()->isOwner()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $deletedCalls = \DB::table('calls')
            ->where('tenant_id', $tenantId)
            ->delete();

        $deletedRecordings = 0;
        $recordingFiles = Storage::disk('recordings')->files($tenantId);

        foreach ($recordingFiles as $file) {
            Storage::disk('recordings')->delete($file);
            $deletedRecordings++;
        }

        // Anonymize users
        User::where('tenant_id', $tenantId)->each(function (User $user) {
            $user->update([
                'name' => 'Deleted User',
                'email' => 'deleted-' . $user->id . '@example.com',
            ]);
        });

        // Anonymize tenant
        TenantModel::where('id', $tenantId)->update([
            'name' => 'Deleted Tenant',
            'settings' => json_encode([]),
        ]);

        activity()
            ->event('data_deleted')
            ->withProperties([
                'deleted_calls' => $deletedCalls,
                'deleted_recordings' => $deletedRecordings,
                'requested_by' => $request->user()->id,
            ])
            ->log('All tenant data deleted per right to be forgotten');

        return response()->json([
            'message' => 'Data deleted successfully',
            'deleted_calls' => $deletedCalls,
            'deleted_recordings' => $deletedRecordings,
        ]);
    }
}
```

- [ ] **Step 2:** Register route

In `routes/web.php`, inside `Route::middleware('auth')->group(function () { ... })`:

```php
Route::delete('/api/tenant/data', [\App\Http\Controllers\Api\DataDeletionController::class, 'destroy'])
    ->name('api.tenant.data.delete');
```

- [ ] **Step 3:** Commit

```bash
git add app/Http/Controllers/Api/DataDeletionController.php routes/web.php
git commit -m "feat(compliance): right to be forgotten endpoint"
```

---

### Task 2.3: Data Export Endpoint

**Files:**
- Create: `app/Http/Controllers/Api/DataExportController.php`
- Modify: `routes/web.php`

- [ ] **Step 1:** Create controller

```php
<?php

namespace App\Http\Controllers\Api;

use App\Domain\Tenant\Repositories\TenantRepositoryInterface;
use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DataExportController extends Controller
{
    public function __construct(
        private readonly TenantRepositoryInterface $tenantRepository,
    ) {}

    public function export(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;

        if (!$request->user()->isOwner()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $tenant = TenantModel::find($tenantId);

        $calls = \DB::table('calls')
            ->where('tenant_id', $tenantId)
            ->get(['sid', 'from_number', 'to_number', 'duration_seconds', 'status', 'direction', 'created_at']);

        $flows = \DB::table('flows')
            ->where('tenant_id', $tenantId)
            ->get(['name', 'status', 'created_at']);

        $users = \DB::table('users')
            ->where('tenant_id', $tenantId)
            ->get(['id', 'name', 'email', 'role']);

        activity()
            ->event('data_exported')
            ->withProperties([
                'calls_count' => $calls->count(),
                'requested_by' => $request->user()->id,
            ])
            ->log('Tenant data exported');

        return response()->json([
            'exported_at' => now()->toIso8601String(),
            'tenant' => [
                'name' => $tenant->name,
                'plan' => $tenant->plan ?? 'free',
                'created_at' => $tenant->created_at,
            ],
            'calls' => $calls,
            'flows' => $flows,
            'users' => $users,
        ]);
    }
}
```

- [ ] **Step 2:** Register route

In `routes/web.php`, inside `Route::middleware('auth')->group(function () { ... })`:

```php
Route::get('/api/tenant/data/export', [\App\Http\Controllers\Api\DataExportController::class, 'export'])
    ->name('api.tenant.data.export');
```

- [ ] **Step 3:** Commit

```bash
git add app/Http/Controllers/Api/DataExportController.php routes/web.php
git commit -m "feat(compliance): data export endpoint"
```

---

### Task 2.4: Data Lifecycle Tests

**Files:**
- Create: `tests/Feature/Commands/PurgeExpiredDataTest.php`
- Create: `tests/Feature/Api/DataDeletionControllerTest.php`
- Create: `tests/Feature/Api/DataExportControllerTest.php`

- [ ] **Step 1:** Write PurgeExpiredDataTest

```php
<?php

namespace Tests\Feature\Commands;

use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Factories\TenantFactory;
use Tests\TestCase;

class PurgeExpiredDataTest extends TestCase
{
    use RefreshDatabase;

    public function test_purges_calls_older_than_retention(): void
    {
        $tenant = TenantFactory::new()->create();
        $tenant->data_protection = ['retention_days' => 30];
        $tenant->save();
        $tenantId = $tenant->id;

        \DB::table('calls')->insert([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'tenant_id' => $tenantId,
            'call_sid' => 'CA' . str_repeat('0', 32),
            'from_number' => '+1234',
            'to_number' => '+5678',
            'status' => 'completed',
            'direction' => 'inbound',
            'created_at' => Carbon::now()->subDays(60),
            'updated_at' => Carbon::now()->subDays(60),
        ]);

        \DB::table('calls')->insert([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'tenant_id' => $tenantId,
            'call_sid' => 'CA' . str_repeat('1', 32),
            'from_number' => '+1234',
            'to_number' => '+5678',
            'status' => 'completed',
            'direction' => 'inbound',
            'created_at' => Carbon::now()->subDays(10),
            'updated_at' => Carbon::now()->subDays(10),
        ]);

        $this->artisan('data:purge-expired')
            ->assertExitCode(0);

        $remaining = \DB::table('calls')->where('tenant_id', $tenantId)->count();
        $this->assertEquals(1, $remaining);
    }

    public function test_purge_skips_tenants_with_no_data_protection(): void
    {
        $tenant = TenantFactory::new()->create();
        $tenant->data_protection = null;
        $tenant->save();

        \DB::table('calls')->insert([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'tenant_id' => $tenant->id,
            'call_sid' => 'CA' . str_repeat('2', 32),
            'from_number' => '+1234',
            'to_number' => '+5678',
            'status' => 'completed',
            'direction' => 'inbound',
            'created_at' => Carbon::now()->subDays(999),
            'updated_at' => Carbon::now()->subDays(999),
        ]);

        $this->artisan('data:purge-expired')
            ->assertExitCode(0);

        $remaining = \DB::table('calls')->where('tenant_id', $tenant->id)->count();
        $this->assertEquals(1, $remaining);
    }
}
```

- [ ] **Step 2:** Write DataDeletionControllerTest

```php
<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Factories\TenantFactory;
use Tests\TestCase;

class DataDeletionControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_delete_tenant_data(): void
    {
        $tenant = TenantFactory::new()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id, 'role' => 'owner']);

        \DB::table('calls')->insert([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'tenant_id' => $tenant->id,
            'call_sid' => 'CA' . str_repeat('0', 32),
            'from_number' => '+1234',
            'to_number' => '+5678',
            'status' => 'completed',
            'direction' => 'inbound',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $response = $this->actingAs($user)->deleteJson('/api/tenant/data');

        $response->assertOk();
        $response->assertJsonStructure(['message', 'deleted_calls', 'deleted_recordings']);

        $this->assertEquals(0, \DB::table('calls')->where('tenant_id', $tenant->id)->count());
    }

    public function test_non_owner_cannot_delete_data(): void
    {
        $tenant = TenantFactory::new()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id, 'role' => 'member']);

        $response = $this->actingAs($user)->deleteJson('/api/tenant/data');

        $response->assertForbidden();
    }

    public function test_unauthenticated_cannot_delete_data(): void
    {
        $response = $this->deleteJson('/api/tenant/data');

        $response->assertUnauthorized();
    }
}
```

- [ ] **Step 3:** Write DataExportControllerTest

```php
<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Factories\TenantFactory;
use Tests\TestCase;

class DataExportControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_export_tenant_data(): void
    {
        $tenant = TenantFactory::new()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id, 'role' => 'owner']);

        $response = $this->actingAs($user)->getJson('/api/tenant/data/export');

        $response->assertOk();
        $response->assertJsonStructure([
            'exported_at',
            'tenant' => ['name', 'plan', 'created_at'],
            'calls',
            'flows',
            'users',
        ]);
    }

    public function test_non_owner_cannot_export_data(): void
    {
        $tenant = TenantFactory::new()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id, 'role' => 'member']);

        $response = $this->actingAs($user)->getJson('/api/tenant/data/export');

        $response->assertForbidden();
    }
}
```

- [ ] **Step 4:** Run all lifecycle tests

```bash
php artisan test --compact --filter="PurgeExpiredDataTest|DataDeletionControllerTest|DataExportControllerTest"
```

Expected: PASS

- [ ] **Step 5:** Commit

```bash
git add tests/Feature/Commands/PurgeExpiredDataTest.php tests/Feature/Api/DataDeletionControllerTest.php tests/Feature/Api/DataExportControllerTest.php
git commit -m "feat(compliance): data lifecycle tests"
```

---

## Sprint 3: Privacy Dashboard (8 pts)

### Task 3.1: PrivacyController + Routes

**Files:**
- Create: `app/Http/Controllers/Web/PrivacyController.php`
- Create: `resources/js/Pages/Settings/Privacy/Index.jsx`
- Modify: `routes/web.php`

- [ ] **Step 1:** Create PrivacyController

```php
<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class PrivacyController extends Controller
{
    public function index(Request $request): Response
    {
        $tenantId = $request->user()->tenant_id;

        $totalCalls = \DB::table('calls')->where('tenant_id', $tenantId)->count();
        $totalUsers = \DB::table('users')->where('tenant_id', $tenantId)->count();
        $totalFlows = \DB::table('flows')->where('tenant_id', $tenantId)->count();
        $oldestCall = \DB::table('calls')
            ->where('tenant_id', $tenantId)
            ->orderBy('created_at')
            ->first();

        $tenant = TenantModel::find($tenantId);

        $consentLogs = Activity::where('event', 'like', 'consent_%')
            ->where('created_at', '>=', now()->subDays(30))
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Settings/Privacy/Index', [
            'summary' => [
                'total_calls' => $totalCalls,
                'total_users' => $totalUsers,
                'total_flows' => $totalFlows,
                'oldest_data' => $oldestCall?->created_at,
            ],
            'dataProtection' => $tenant->data_protection,
            'consentLogs' => $consentLogs,
        ]);
    }
}
```

- [ ] **Step 2:** Register routes

In `routes/web.php`:

```php
Route::get('/settings/privacy', [PrivacyController::class, 'index'])
    ->name('settings.privacy');
```

- [ ] **Step 3:** Create Privacy page React component

```jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Heading, Subheading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Badge } from '@/Components/catalyst/badge';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/Components/catalyst/table';
import { Pagination, PaginationList, PaginationNext, PaginationPrevious, PaginationPage, PaginationGap } from '@/Components/catalyst/pagination';

export default function Index({ summary, dataProtection, consentLogs }) {
    return (
        <AuthenticatedLayout>
            <Head title="Privacy & Compliance" />

            <div className="flex items-end justify-between">
                <div>
                    <Heading>Privacy & Compliance</Heading>
                    <Text className="mt-1">Data summary, consent logs, and compliance tools.</Text>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-zinc-950/5 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
                    <Text className="text-sm text-zinc-500">Total Calls</Text>
                    <p className="mt-1 text-2xl font-semibold">{summary.total_calls}</p>
                </div>
                <div className="rounded-xl border border-zinc-950/5 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
                    <Text className="text-sm text-zinc-500">Users</Text>
                    <p className="mt-1 text-2xl font-semibold">{summary.total_users}</p>
                </div>
                <div className="rounded-xl border border-zinc-950/5 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
                    <Text className="text-sm text-zinc-500">Flows</Text>
                    <p className="mt-1 text-2xl font-semibold">{summary.total_flows}</p>
                </div>
                <div className="rounded-xl border border-zinc-950/5 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
                    <Text className="text-sm text-zinc-500">Retention</Text>
                    <p className="mt-1 text-2xl font-semibold">{dataProtection.retention_days} days</p>
                </div>
            </div>

            <div className="mt-8">
                <div className="flex items-center justify-between">
                    <Subheading>Data Map</Subheading>
                </div>
                <div className="mt-4 rounded-xl border border-zinc-950/5 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Data Type</TableHeader>
                                <TableHeader>Storage</TableHeader>
                                <TableHeader>Retention</TableHeader>
                                <TableHeader>Encrypted</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium">Call Recordings</TableCell>
                                <TableCell>Local filesystem</TableCell>
                                <TableCell>{dataProtection.retention_days} days</TableCell>
                                <TableCell><Badge color="emerald">Yes</Badge></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Call Logs</TableCell>
                                <TableCell>Database</TableCell>
                                <TableCell>{dataProtection.retention_days} days</TableCell>
                                <TableCell><Badge color="zinc">No</Badge></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">User Accounts</TableCell>
                                <TableCell>Database</TableCell>
                                <TableCell>Lifetime</TableCell>
                                <TableCell><Badge color="zinc">No</Badge></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Configuration</TableCell>
                                <TableCell>Database (JSON)</TableCell>
                                <TableCell>Lifetime</TableCell>
                                <TableCell><Badge color="emerald">Partial</Badge></TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className="mt-8">
                <Subheading>Actions</Subheading>
                <div className="mt-4 flex gap-4">
                    <Link href="/api/tenant/data/export">
                        <Button>Export Data</Button>
                    </Link>
                    <Link href="/settings/data-protection">
                        <Button outline>Data Protection Settings</Button>
                    </Link>
                </div>
            </div>

            <div className="mt-8">
                <Subheading>Recent Consent Activity</Subheading>
                <div className="mt-4">
                    {consentLogs.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-950/10 py-12 dark:border-white/10">
                            <p className="text-base font-semibold text-zinc-950 dark:text-white">No consent events</p>
                            <Text className="mt-2">Consent events will appear here when calls are recorded.</Text>
                        </div>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeader>Event</TableHeader>
                                    <TableHeader>Caller</TableHeader>
                                    <TableHeader>Date</TableHeader>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {consentLogs.data.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell>
                                            <Badge color={log.event === 'consent_granted' ? 'emerald' : 'red'}>
                                                {log.event === 'consent_granted' ? 'Granted' : 'Declined'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{log.properties?.caller ?? '-'}</TableCell>
                                        <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}

                    {consentLogs.total > consentLogs.per_page && (
                        <Pagination className="mt-4">
                            <PaginationPrevious href={consentLogs.prev_page_url} />
                            <PaginationList>
                                {Array.from({ length: Math.ceil(consentLogs.total / consentLogs.per_page) }, (_, i) => (
                                    <PaginationPage key={i + 1} href={consentLogs.path + '?page=' + (i + 1)} current={consentLogs.current_page === i + 1}>
                                        {i + 1}
                                    </PaginationPage>
                                ))}
                            </PaginationList>
                            <PaginationNext href={consentLogs.next_page_url} />
                        </Pagination>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
```

- [ ] **Step 4:** Run Wayfinder

```bash
php artisan wayfinder:generate
```

- [ ] **Step 5:** Build frontend

```bash
pnpm run build
```

- [ ] **Step 6:** Commit

```bash
git add app/Http/Controllers/Web/PrivacyController.php resources/js/Pages/Settings/Privacy/Index.jsx routes/web.php
git commit -m "feat(compliance): privacy dashboard with data map and consent logs"
```

---

### Task 3.2: Compliance Digest Email

**Files:**
- Create: `app/Mail/ComplianceDigest.php`
- Create: `app/Console/Commands/SendComplianceDigests.php`
- Modify: `routes/console.php`

- [ ] **Step 1:** Create Mailable

```bash
php artisan make:mail ComplianceDigest
```

```php
<?php

namespace App\Mail;

use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ComplianceDigest extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public TenantModel $tenant,
        public array $stats,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Weekly Compliance Summary — ' . $this->tenant->name,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.compliance-digest',
        );
    }
}
```

Create `resources/views/emails/compliance-digest.blade.php`:

```blade
<x-mail::message>
# Compliance Summary

Hi **{{ $tenant->name }}**,

Here is your weekly compliance summary.

**Data Overview:**
- Total calls: {{ $stats['total_calls'] }}
- Active recordings: {{ $stats['total_recordings'] }}
- Retention period: {{ $stats['retention_days'] }} days
- Expiring within 7 days: {{ $stats['expiring_soon'] }}

<x-mail::button :url="config('app.url') . '/settings/privacy'">
View Privacy Dashboard
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
```

- [ ] **Step 2:** Create SendComplianceDigests command

```bash
php artisan make:command SendComplianceDigests
```

```php
<?php

namespace App\Console\Commands;

use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Mail\ComplianceDigest;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendComplianceDigests extends Command
{
    protected $signature = 'compliance:digest';
    protected $description = 'Send weekly compliance digest to tenant owners';

    public function handle(): int
    {
        $tenants = TenantModel::all();

        foreach ($tenants as $tenant) {
            $dp = $tenant->data_protection;
            $retentionDays = $dp['retention_days'] ?? 90;
            $cutoff = Carbon::now()->addDays(7);

            $totalCalls = \DB::table('calls')->where('tenant_id', $tenant->id)->count();
            $totalRecordings = 0; // computed from storage or calls with recording_url set
            $expiringSoon = \DB::table('calls')
                ->where('tenant_id', $tenant->id)
                ->where('created_at', '<', $cutoff->copy()->subDays($retentionDays))
                ->where('created_at', '>=', Carbon::now()->subDays($retentionDays))
                ->count();

            $stats = [
                'total_calls' => $totalCalls,
                'total_recordings' => $totalRecordings,
                'retention_days' => $retentionDays,
                'expiring_soon' => $expiringSoon,
            ];

            $owners = User::where('tenant_id', $tenant->id)
                ->where('role', 'owner')
                ->whereNotNull('email_verified_at')
                ->get();

            foreach ($owners as $owner) {
                Mail::to($owner->email)->queue(new ComplianceDigest($tenant, $stats));
            }

            activity()
                ->event('compliance_digest_sent')
                ->withProperties(['tenant_id' => $tenant->id])
                ->log('Weekly compliance digest sent');
        }

        $this->info('Compliance digests sent to ' . $tenants->count() . ' tenants');

        return Command::SUCCESS;
    }
}
```

- [ ] **Step 3:** Add schedule

In `routes/console.php`:

```php
Schedule::command('compliance:digest')->weekly()->mondays()->at('08:00');
```

- [ ] **Step 4:** Commit

```bash
git add app/Mail/ComplianceDigest.php resources/views/emails/compliance-digest.blade.php app/Console/Commands/SendComplianceDigests.php routes/console.php
git commit -m "feat(compliance): weekly compliance digest email"
```

---

### Task 3.3: Privacy Dashboard Tests

**Files:**
- Create: `tests/Feature/Web/PrivacyPageTest.php`
- Create: `tests/Feature/Commands/SendComplianceDigestsTest.php`

- [ ] **Step 1:** Write PrivacyPageTest

```php
<?php

namespace Tests\Feature\Web;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Factories\TenantFactory;
use Tests\TestCase;

class PrivacyPageTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $tenant = TenantFactory::new()->create();
        $this->user = User::factory()->create(['tenant_id' => $tenant->id]);
    }

    public function test_privacy_page_loads(): void
    {
        $this->actingAs($this->user)
            ->get('/settings/privacy')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Settings/Privacy/Index')
                ->has('summary')
                ->has('dataProtection')
                ->has('consentLogs')
            );
    }

    public function test_unauthenticated_redirects(): void
    {
        $this->get('/settings/privacy')
            ->assertRedirect('login');
    }
}
```

- [ ] **Step 2:** Write SendComplianceDigestsTest

```php
<?php

namespace Tests\Feature\Commands;

use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\Factories\TenantFactory;
use Tests\TestCase;

class SendComplianceDigestsTest extends TestCase
{
    use RefreshDatabase;

    public function test_sends_digest_to_owners(): void
    {
        Mail::fake();

        $tenant = TenantFactory::new()->create();
        $tenant->data_protection = ['retention_days' => 90];
        $tenant->save();

        User::factory()->create([
            'tenant_id' => $tenant->id,
            'role' => 'owner',
            'email_verified_at' => now(),
        ]);

        $this->artisan('compliance:digest')
            ->assertExitCode(0);

        Mail::assertQueued(\App\Mail\ComplianceDigest::class);
    }

    public function test_skips_tenants_without_owners(): void
    {
        Mail::fake();

        $tenant = TenantFactory::new()->create();

        $this->artisan('compliance:digest')
            ->assertExitCode(0);

        Mail::assertNothingQueued();
    }
}
```

- [ ] **Step 3:** Run tests

```bash
php artisan test --compact --filter="PrivacyPageTest|SendComplianceDigestsTest"
```

Expected: PASS

- [ ] **Step 4:** Run full QA suite

```bash
php artisan test --compact --filter="DataProtection|ConsentDisclosure|PurgeExpiredData|DataDeletion|DataExport|PrivacyPage|SendComplianceDigests"
```

Expected: all pass

- [ ] **Step 5:** Run PHPStan + Pint

```bash
composer phpstan
vendor/bin/pint --format agent
pnpm run build
```

- [ ] **Step 6:** Commit

```bash
git add tests/Feature/Web/PrivacyPageTest.php tests/Feature/Commands/SendComplianceDigestsTest.php
git commit -m "feat(compliance): privacy dashboard and digest tests"
```

---

## Appendix: Files Created/Modified

| Sprint | File | Action |
|--------|------|--------|
| 1.1 | `database/migrations/xxxx_add_data_protection_to_tenants.php` | Create |
| 1.1 | `app/Infrastructure/Persistence/Eloquent/Tenant/TenantModel.php` | Modify |
| 1.2 | `app/Http/Controllers/Web/DataProtectionController.php` | Create |
| 1.2 | `routes/web.php` | Modify |
| 1.3 | `resources/js/Pages/Settings/DataProtection/Index.jsx` | Create |
| 1.4 | `app/Http/Controllers/Twilio/WebhookController.php` | Modify |
| 1.4 | `routes/web.php` | Modify |
| 1.5 | `tests/Feature/Twilio/ConsentDisclosureTest.php` | Create |
| 2.1 | `app/Console/Commands/PurgeExpiredData.php` | Create |
| 2.1 | `routes/console.php` | Modify |
| 2.2 | `app/Http/Controllers/Api/DataDeletionController.php` | Create |
| 2.2 | `routes/web.php` | Modify |
| 2.3 | `app/Http/Controllers/Api/DataExportController.php` | Create |
| 2.3 | `routes/web.php` | Modify |
| 2.4 | `tests/Feature/Commands/PurgeExpiredDataTest.php` | Create |
| 2.4 | `tests/Feature/Api/DataDeletionControllerTest.php` | Create |
| 2.4 | `tests/Feature/Api/DataExportControllerTest.php` | Create |
| 3.1 | `app/Http/Controllers/Web/PrivacyController.php` | Create |
| 3.1 | `resources/js/Pages/Settings/Privacy/Index.jsx` | Create |
| 3.1 | `routes/web.php` | Modify |
| 3.2 | `app/Mail/ComplianceDigest.php` | Create |
| 3.2 | `resources/views/emails/compliance-digest.blade.php` | Create |
| 3.2 | `app/Console/Commands/SendComplianceDigests.php` | Create |
| 3.2 | `routes/console.php` | Modify |
| 3.3 | `tests/Feature/Web/PrivacyPageTest.php` | Create |
| 3.3 | `tests/Feature/Commands/SendComplianceDigestsTest.php` | Create |

**Total: ~26 files (15 new, 11 modified)**
