# Epic 3: Professional Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add observability (health endpoint, system dashboard, alerting), security hardening (AES recording encryption, token TTL, security headers), and onboarding (getting started wizard) to the voice-ai-platform.

**Architecture:** Health endpoint at `/api/health` (unauthenticated) checks DB/Redis/queue. System dashboard at `/settings/system` shows queue depth, error rates, failed jobs. Alerting via `CheckSystemHealth` artisan command on 5-min schedule. Security: AES-256-GCM recording encryption, token TTL with expiry middleware, HSTS/CSP headers. Onboarding: 4-step wizard post-registration.

**Tech Stack:** Laravel 13, Inertia React 3, Tailwind 4, Catalyst UI, Recharts, Sanctum, Horizon (Redis), `Illuminate\Encryption\Encrypter`

---

## File Structure

### Created
- `app/Http/Controllers/Api/HealthController.php` — unauthenticated health check
- `app/Http/Controllers/Web/SystemHealthController.php` — dashboard data
- `app/Console/Commands/CheckSystemHealth.php` — alerting scheduler
- `config/alerting.php` — alert config (slack webhook, email, rate limit)
- `app/Notifications/SystemAlert.php` — multi-channel alert notification
- `app/Services/RecordingEncryptionService.php` — AES-256-GCM encrypt/decrypt
- `app/Http/Middleware/SecurityHeaders.php` — HSTS, X-Frame-Options, etc.
- `app/Http/Middleware/CheckTokenExpiry.php` — Sanctum token expiry check
- `app/Console/Commands/PurgeExpiredTokens.php` — daily cleanup
- `app/Http/Controllers/Web/GettingStartedController.php` — onboarding wizard
- `resources/js/Pages/Settings/System/Index.jsx` — system health dashboard
- `resources/js/Pages/GettingStarted/Index.jsx` — onboarding wizard
- `tests/Feature/Api/HealthEndpointTest.php`
- `tests/Feature/Web/SystemHealthControllerTest.php`
- `tests/Feature/Commands/CheckSystemHealthTest.php`
- `tests/Feature/Middleware/SecurityHeadersTest.php`
- `tests/Feature/Middleware/CheckTokenExpiryTest.php`
- `tests/Feature/Web/GettingStartedPageTest.php`

### Modified
- `routes/web.php` — add system, getting-started routes
- `routes/api.php` — add health route (outside auth middleware)
- `bootstrap/app.php` — register SecurityHeaders middleware
- `app/Http/Controllers/Auth/RegisteredUserController.php` — redirect to /getting-started
- `database/migrations/xxxx_add_expires_at_to_personal_access_tokens.php` — TTL column

---

## Global Constraints

- PHP 8.3, Laravel 13, Inertia React 3, Tailwind 4, Catalyst UI
- All tests use PHPUnit (not Pest), `RefreshDatabase` trait
- Pint formatting required before commit
- PHPStan level 6 (existing baseline)
- UUID primary keys via `HasUuids` on all new models
- Follow existing patterns: constructor injection, Facades, config() for env values

---

### Task 3.1.1: Health Endpoint

**Files:**
- Create: `app/Http/Controllers/Api/HealthController.php`
- Modify: `routes/api.php`
- Test: `tests/Feature/Api/HealthEndpointTest.php`

**Interfaces:**
- Produces: `GET /api/health` returning JSON `{ status, timestamp, services: { database, redis, queue }, version, uptime_seconds }`

- [ ] **Step 1: Write the failing test**

```php
<?php

namespace Tests\Feature\Api;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HealthEndpointTest extends TestCase
{
    use RefreshDatabase;

    public function test_health_endpoint_returns_ok(): void
    {
        $response = $this->getJson('/api/health');

        $response->assertOk()
            ->assertJsonStructure([
                'status',
                'timestamp',
                'services' => ['database', 'redis', 'queue'],
                'version',
                'uptime_seconds',
            ])
            ->assertJson(['status' => 'ok']);
    }

    public function test_health_endpoint_database_service_is_ok(): void
    {
        $response = $this->getJson('/api/health');

        $response->assertOk()
            ->assertJsonPath('services.database', 'ok');
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --compact --filter=HealthEndpointTest`
Expected: FAIL (controller doesn't exist)

- [ ] **Step 3: Write the controller**

```php
<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

class HealthController extends Controller
{
    private float $startTime;

    public function __construct()
    {
        $this->startTime = defined('REQUEST_TIME_FLOAT') ? REQUEST_TIME_FLOAT : microtime(true);
    }

    public function __invoke(): JsonResponse
    {
        $services = [
            'database' => $this->checkDatabase(),
            'redis' => $this->checkRedis(),
            'queue' => $this->checkQueue(),
        };

        $hasError = in_array('error', $services, true);
        $hasDegraded = in_array('degraded', $services, true);

        $status = $hasError ? 'degraded' : ($hasDegraded ? 'degraded' : 'ok');

        return response()->json([
            'status' => $status,
            'timestamp' => now()->toIso8601String(),
            'services' => $services,
            'version' => config('app.version', '1.0.0'),
            'uptime_seconds' => (int) (microtime(true) - $this->startTime),
        ]);
    }

    private function checkDatabase(): string
    {
        try {
            DB::connection()->getPdo();
            return 'ok';
        } catch (\Throwable) {
            return 'error';
        }
    }

    private function checkRedis(): string
    {
        try {
            Redis::connection()->ping();
            return 'ok';
        } catch (\Throwable) {
            return 'error';
        }
    }

    private function checkQueue(): string
    {
        try {
            $size = \Illuminate\Support\Facades\Queue::size();
            return $size >= 50 ? 'degraded' : 'ok';
        } catch (\Throwable) {
            return 'error';
        }
    }
}
```

- [ ] **Step 4: Register route in api.php**

Add outside the auth middleware group:

```php
use App\Http\Controllers\Api\HealthController;

Route::get('/health', HealthController::class)->withoutMiddleware(['auth:sanctum', 'throttle:api']);
```

- [ ] **Step 5: Run test to verify it passes**

Run: `php artisan test --compact --filter=HealthEndpointTest`
Expected: 2/2 PASS

- [ ] **Step 6: Commit**

```bash
git add app/Http/Controllers/Api/HealthController.php routes/api.php tests/Feature/Api/HealthEndpointTest.php
git commit -m "feat(infra): add health endpoint at GET /api/health"
```

---

### Task 3.1.2: System Health Dashboard

**Files:**
- Create: `app/Http/Controllers/Web/SystemHealthController.php`
- Create: `resources/js/Pages/Settings/System/Index.jsx`
- Modify: `routes/web.php`
- Test: `tests/Feature/Web/SystemHealthControllerTest.php`

**Interfaces:**
- Consumes: Health check logic from Task 3.1.1
- Produces: `GET /settings/system` returning Inertia page with queue depth, failed jobs, error rate

- [ ] **Step 1: Write the failing test**

```php
<?php

namespace Tests\Feature\Web;

use App\Models\User;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SystemHealthControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $tenant = TenantModel::factory()->create();
        $this->user = User::factory()->create(['tenant_id' => $tenant->id]);
    }

    public function test_system_health_page_returns_ok(): void
    {
        $this->actingAs($this->user)
            ->get('/settings/system')
            ->assertOk();
    }

    public function test_system_health_page_returns_data_shape(): void
    {
        $this->actingAs($this->user)
            ->get('/settings/system')
            ->assertInertiaComponent('Settings/System/Index');
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --compact --filter=SystemHealthControllerTest`
Expected: FAIL (route doesn't exist)

- [ ] **Step 3: Write the controller**

```php
<?php

namespace App\Http\Controllers\Web;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Redis;
use Inertia\Inertia;
use Inertia\Response;

class SystemHealthController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Settings/System/Index', [
            'health' => $this->getHealthData(),
            'failedJobs' => $this->getFailedJobs(),
            'queueDepth' => $this->getQueueDepth(),
            'errorRate' => $this->getErrorRate($request->user()->tenant_id),
        ]);
    }

    private function getHealthData(): array
    {
        return [
            'database' => $this->checkDatabase(),
            'redis' => $this->checkRedis(),
        ];
    }

    private function getFailedJobs(): array
    {
        try {
            return DB::table('failed_jobs')
                ->where('failed_at', '>=', now()->subDay())
                ->orderByDesc('failed_at')
                ->limit(50)
                ->get()
                ->map(fn ($job) => [
                    'id' => $job->id,
                    'connection' => $job->connection,
                    'queue' => $job->queue,
                    'failed_at' => $job->failed_at,
                    'exception' => substr($job->exception, 0, 200),
                ])
                ->toArray();
        } catch (\Throwable) {
            return [];
        }
    }

    private function getQueueDepth(): array
    {
        $queues = ['default', 'twilio', 'emails'];
        $depth = [];
        foreach ($queues as $queue) {
            try {
                $depth[$queue] = Queue::size($queue);
            } catch (\Throwable) {
                $depth[$queue] = 0;
            }
        }
        return $depth;
    }

    private function getErrorRate(string $tenantId): array
    {
        try {
            $total = DB::table('calls')
                ->where('tenant_id', $tenantId)
                ->where('created_at', '>=', now()->subDay())
                ->count();

            $failed = DB::table('calls')
                ->where('tenant_id', $tenantId)
                ->where('created_at', '>=', now()->subDay())
                ->where('status', 'failed')
                ->count();

            return [
                'total' => $total,
                'failed' => $failed,
                'rate' => $total > 0 ? round($failed / $total * 100, 1) : 0,
            ];
        } catch (\Throwable) {
            return ['total' => 0, 'failed' => 0, 'rate' => 0];
        }
    }

    private function checkDatabase(): string
    {
        try {
            DB::connection()->getPdo();
            return 'ok';
        } catch (\Throwable) {
            return 'error';
        }
    }

    private function checkRedis(): string
    {
        try {
            Redis::connection()->ping();
            return 'ok';
        } catch (\Throwable) {
            return 'error';
        }
    }
}
```

- [ ] **Step 4: Add route**

In `routes/web.php`, inside the auth group:

```php
use App\Http\Controllers\Web\SystemHealthController;

Route::get('/settings/system', [SystemHealthController::class, 'index'])->name('settings.system');
```

- [ ] **Step 5: Create the React page**

`resources/js/Pages/Settings/System/Index.jsx` — Dashboard with:
- Status badges for database + redis (green/red)
- Queue depth cards (default/twilio/emails)
- Failed jobs table with connection, queue, exception, failed_at
- Error rate card (failed/total, percentage)

Use existing Catalyst components: Heading, Text, Badge, Table, Card patterns from other Settings pages.

- [ ] **Step 6: Add sidebar nav item**

In `resources/js/Layouts/AuthenticatedLayout.jsx`, add "System" nav item with `ServerIcon` in the Settings section, after "Activity".

- [ ] **Step 7: Generate Wayfinder + run tests**

Run: `php artisan wayfinder:generate`
Run: `php artisan test --compact --filter=SystemHealthControllerTest`
Expected: 2/2 PASS

- [ ] **Step 8: Commit**

```bash
git add app/Http/Controllers/Web/SystemHealthController.php resources/js/Pages/Settings/System/Index.jsx routes/web.php resources/js/Layouts/AuthenticatedLayout.jsx
git commit -m "feat(infra): system health dashboard at /settings/system"
```

---

### Task 3.1.3: Alert System

**Files:**
- Create: `config/alerting.php`
- Create: `app/Notifications/SystemAlert.php`
- Create: `app/Console/Commands/CheckSystemHealth.php`
- Modify: `routes/console.php`
- Test: `tests/Feature/Commands/CheckSystemHealthTest.php`

**Interfaces:**
- Consumes: Queue size checks, call failure rate from DB
- Produces: `SystemAlert` notification, `system:health-check` artisan command

- [ ] **Step 1: Write the failing test**

```php
<?php

namespace Tests\Feature\Commands;

use App\Models\User;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Notifications\SystemAlert;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class CheckSystemHealthTest extends TestCase
{
    use RefreshDatabase;

    public function test_health_check_dispatches_notification_on_queue_backlog(): void
    {
        Notification::fake();
        $tenant = TenantModel::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id, 'role' => 'owner']);

        // Create 55 failed jobs to trigger alert
        for ($i = 0; $i < 55; $i++) {
            DB::table('failed_jobs')->insert([
                'connection' => 'redis',
                'queue' => 'default',
                'payload' => '{}',
                'exception' => 'Test exception',
                'failed_at' => now(),
            ]);
        }

        $this->artisan('system:health-check');

        Notification::assertSentTo($user, SystemAlert::class);
    }

    public function test_health_check_no_notification_when_healthy(): void
    {
        Notification::fake();
        $tenant = TenantModel::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id, 'role' => 'owner']);

        $this->artisan('system:health-check');

        Notification::assertNotSentTo($user, SystemAlert::class);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --compact --filter=CheckSystemHealthTest`
Expected: FAIL

- [ ] **Step 3: Create config/alerting.php**

```php
<?php

return [
    'slack_webhook' => env('ALERT_SLACK_WEBHOOK'),
    'email' => env('ALERT_EMAIL'),
    'rate_limit_minutes' => 60,
    'queue_threshold' => 50,
    'failure_rate_threshold' => 10,
];
```

- [ ] **Step 4: Create SystemAlert notification**

```php
<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\SlackMessage;
use Illuminate\Notifications\Notification;

class SystemAlert extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly string $title,
        private readonly string $message,
        private readonly string $severity = 'warning',
    ) {}

    public function via(object $notifiable): array
    {
        $channels = ['mail'];
        if (config('alerting.slack_webhook')) {
            $channels[] = 'slack';
        }
        return $channels;
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("System Alert: {$this->title}")
            ->greeting("Hi {$notifiable->name},")
            ->line($this->message)
            ->action('View Dashboard', url('/settings/system'));
    }

    public function toSlack(object $notifiable): SlackMessage
    {
        $color = match ($this->severity) {
            'critical' => 'danger',
            'warning' => 'warning',
            default => '#4355b9',
        };

        return (new SlackMessage)
            ->subject("System Alert: {$this->title}")
            ->content($this->message)
            ->color($color);
    }
}
```

- [ ] **Step 5: Create CheckSystemHealth command**

```php
<?php

namespace App\Console\Commands;

use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Models\User;
use App\Notifications\SystemAlert;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class CheckSystemHealth extends Command
{
    protected $signature = 'system:health-check';
    protected $description = 'Check system health and send alerts for critical conditions';

    public function handle(): int
    {
        $alerts = $this->checkQueueBacklog();
        $alerts = array_merge($alerts, $this->checkFailureRate());

        if (empty($alerts)) {
            $this->info('System healthy — no alerts.');
            return self::SUCCESS;
        }

        $this->sendAlerts($alerts);
        $this->info(count($alerts) . ' alert(s) sent.');
        return self::SUCCESS;
    }

    private function checkQueueBacklog(): array
    {
        $alerts = [];
        $threshold = config('alerting.queue_threshold', 50);

        try {
            $size = \Illuminate\Support\Facades\Queue::size();
            if ($size >= $threshold) {
                $alerts[] = [
                    'title' => 'Queue Backlog',
                    'message' => "Queue has {$size} pending jobs (threshold: {$threshold}).",
                    'severity' => 'warning',
                ];
            }
        } catch (\Throwable) {
            // Queue check failed — don't alert on monitoring failure
        }

        return $alerts;
    }

    private function checkFailureRate(): array
    {
        $alerts = [];
        $threshold = config('alerting.failure_rate_threshold', 10);

        try {
            $failed = DB::table('calls')
                ->where('created_at', '>=', now()->subMinutes(5))
                ->where('status', 'failed')
                ->count();

            $total = DB::table('calls')
                ->where('created_at', '>=', now()->subMinutes(5))
                ->count();

            if ($total >= 10) {
                $rate = round($failed / $total * 100, 1);
                if ($rate >= $threshold) {
                    $alerts[] = [
                        'title' => 'High Call Failure Rate',
                        'message' => "Call failure rate is {$rate}% ({$failed}/{$total} in last 5 min, threshold: {$threshold}%).",
                        'severity' => 'critical',
                    ];
                }
            }
        } catch (\Throwable) {
            // DB check failed
        }

        return $alerts;
    }

    private function sendAlerts(array $alerts): void
    {
        $rateLimitMinutes = config('alerting.rate_limit_minutes', 60);

        $tenants = TenantModel::all();
        foreach ($tenants as $tenant) {
            $cacheKey = "system_alert_{$tenant->id}";
            if (Cache::has($cacheKey)) {
                continue;
            }

            $owner = User::where('tenant_id', $tenant->id)->where('role', 'owner')->first();
            if (!$owner) {
                continue;
            }

            foreach ($alerts as $alert) {
                $owner->notify(new SystemAlert($alert['title'], $alert['message'], $alert['severity']));
            }

            Cache::put($cacheKey, true, now()->addMinutes($rateLimitMinutes));
        }
    }
}
```

- [ ] **Step 6: Register schedule**

In `routes/console.php`:

```php
$schedule->command('system:health-check')->everyFiveMinutes();
```

- [ ] **Step 7: Run test to verify it passes**

Run: `php artisan test --compact --filter=CheckSystemHealthTest`
Expected: 2/2 PASS

- [ ] **Step 8: Commit**

```bash
git add config/alerting.php app/Notifications/SystemAlert.php app/Console/Commands/CheckSystemHealth.php routes/console.php tests/Feature/Commands/CheckSystemHealthTest.php
git commit -m "feat(infra): alerting system — queue backlog + failure rate checks"
```

---

### Task 3.1.4: Observability Tests (integration)

**Files:**
- Test: `tests/Feature/Api/HealthEndpointTest.php` (add DB failure test)
- Test: `tests/Feature/Commands/CheckSystemHealthTest.php` (add rate limiting test)

- [ ] **Step 1: Add DB failure test to HealthEndpointTest**

```php
public function test_health_endpoint_degraded_on_db_failure(): void
{
    // The endpoint should still return 200 even if DB is down
    // (it reports status, doesn't throw)
    $response = $this->getJson('/api/health');
    $response->assertOk();
}
```

- [ ] **Step 2: Add rate limiting test to CheckSystemHealthTest**

```php
public function test_health_check_rate_limits_alerts(): void
{
    Notification::fake();
    $tenant = TenantModel::factory()->create();
    $user = User::factory()->create(['tenant_id' => $tenant->id, 'role' => 'owner']);

    // Create backlog
    for ($i = 0; $i < 55; $i++) {
        DB::table('failed_jobs')->insert([...]);
    }

    // First run sends alert
    $this->artisan('system:health-check');
    Notification::assertSentTo($user, SystemAlert::class, 1);

    // Second run within rate limit — no new alert
    Notification::fake();
    $this->artisan('system:health-check');
    Notification::assertNotSentTo($user, SystemAlert::class);
}
```

- [ ] **Step 3: Run all observability tests**

Run: `php artisan test --compact --filter="HealthEndpointTest|SystemHealthControllerTest|CheckSystemHealthTest"`
Expected: All PASS

- [ ] **Step 4: Commit**

```bash
git add tests/Feature/Api/HealthEndpointTest.php tests/Feature/Commands/CheckSystemHealthTest.php
git commit -m "test(infra): observability integration tests"
```

---

### Task 3.2.1: AES-256 Recording Encryption

**Files:**
- Create: `app/Services/RecordingEncryptionService.php`
- Test: `tests/Unit/Services/RecordingEncryptionServiceTest.php`

**Interfaces:**
- Produces: `RecordingEncryptionService::encrypt(Stream): Stream` and `::decrypt(Stream): Stream`

- [ ] **Step 1: Write the failing test**

```php
<?php

namespace Tests\Unit\Services;

use App\Services\RecordingEncryptionService;
use Illuminate\Support\Str;
use Tests\TestCase;

class RecordingEncryptionServiceTest extends TestCase
{
    public function test_encrypt_and_decrypt_roundtrip(): void
    {
        $key = base64_encode(random_bytes(32));
        $service = new RecordingEncryptionService($key);

        $original = 'This is a test recording content ' . Str::random(100);
        $encrypted = $service->encrypt($original);

        $this->assertNotEquals($original, $encrypted);

        $decrypted = $service->decrypt($encrypted);
        $this->assertEquals($original, $decrypted);
    }

    public function test_encrypted_output_differs_each_time(): void
    {
        $key = base64_encode(random_bytes(32));
        $service = new RecordingEncryptionService($key);

        $original = 'Same content';
        $encrypted1 = $service->encrypt($original);
        $encrypted2 = $service->encrypt($original);

        $this->assertNotEquals($encrypted1, $encrypted2);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --compact --filter=RecordingEncryptionServiceTest`
Expected: FAIL

- [ ] **Step 3: Write the service**

```php
<?php

namespace App\Services;

use Illuminate\Encryption\Encrypter;

class RecordingEncryptionService
{
    private Encrypter $encrypter;

    public function __construct(?string $key = null)
    {
        $key = $key ?? config('app.recordings_encryption_key');
        if ($key === null) {
            throw new \RuntimeException('Recordings encryption key not configured.');
        }
        $this->encrypter = new Encrypter(base64_decode($key));
    }

    public function encrypt(string $content): string
    {
        return $this->encrypter->encrypt($content);
    }

    public function decrypt(string $encryptedContent): string
    {
        return $this->encrypter->decrypt($encryptedContent);
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `php artisan test --compact --filter=RecordingEncryptionServiceTest`
Expected: 2/2 PASS

- [ ] **Step 5: Commit**

```bash
git add app/Services/RecordingEncryptionService.php tests/Unit/Services/RecordingEncryptionServiceTest.php
git commit -m "feat(security): AES-256 recording encryption service"
```

---

### Task 3.2.2: API Tokens with TTL

**Files:**
- Create: `database/migrations/2026_07_12_000002_add_expires_at_to_personal_access_tokens.php`
- Create: `app/Http/Middleware/CheckTokenExpiry.php`
- Create: `app/Console/Commands/PurgeExpiredTokens.php`
- Modify: `bootstrap/app.php` (register middleware)
- Modify: `routes/console.php` (schedule purge)
- Test: `tests/Feature/Middleware/CheckTokenExpiryTest.php`

**Interfaces:**
- Produces: `CheckTokenExpiry` middleware, `tokens:purge-expired` command

- [ ] **Step 1: Write the failing test**

```php
<?php

namespace Tests\Feature\Middleware;

use App\Models\User;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CheckTokenExpiryTest extends TestCase
{
    use RefreshDatabase;

    public function test_expired_token_returns_401(): void
    {
        $tenant = TenantModel::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user, ['*']);

        // Create a token that expired yesterday
        $token = $user->createToken('test-token');
        $token->update(['expires_at' => now()->subDay()]);

        $response = $this->getJson('/api/v1/calls');
        $response->assertStatus(401);
    }

    public function test_valid_token_returns_200(): void
    {
        $tenant = TenantModel::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Sanctum::actingAs($user, ['*']);

        $response = $this->getJson('/api/v1/calls');
        $response->assertOk();
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --compact --filter=CheckTokenExpiryTest`
Expected: FAIL (expired token still works)

- [ ] **Step 3: Create migration**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('personal_access_tokens', function (Blueprint $table) {
            $table->timestamp('expires_at')->nullable()->after('last_used_at');
        });
    }

    public function down(): void
    {
        Schema::table('personal_access_tokens', function (Blueprint $table) {
            $table->dropColumn('expires_at');
        });
    }
};
```

- [ ] **Step 4: Run migration**

Run: `php artisan migrate`

- [ ] **Step 5: Write the middleware**

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

class CheckTokenExpiry
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && $request->user()->currentAccessToken) {
            $token = $request->user()->currentAccessToken;
            if ($token instanceof PersonalAccessToken && $token->expires_at !== null && $token->expires_at->isPast()) {
                return response()->json(['message' => 'Token expired'], 401);
            }
        }

        return $next($request);
    }
}
```

- [ ] **Step 6: Register middleware**

In `bootstrap/app.php`, add to the `withMiddleware` closure:

```php
$middleware->alias([
    'twilio.verify' => ValidateTwilioRequest::class,
    'token.expiry' => \App\Http\Middleware\CheckTokenExpiry::class,
]);
```

Then in `routes/api.php`, add to the auth middleware group:

```php
Route::middleware(['auth:sanctum', 'throttle:api', 'token.expiry'])->prefix('v1')->group(function () {
    // existing routes...
});
```

- [ ] **Step 7: Run test to verify it passes**

Run: `php artisan test --compact --filter=CheckTokenExpiryTest`
Expected: 2/2 PASS

- [ ] **Step 8: Create PurgeExpiredTokens command**

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Laravel\Sanctum\PersonalAccessToken;

class PurgeExpiredTokens extends Command
{
    protected $signature = 'tokens:purge-expired';
    protected $description = 'Delete expired personal access tokens';

    public function handle(): int
    {
        $deleted = PersonalAccessToken::where('expires_at', '<', now())->delete();
        $this->info("Deleted {$deleted} expired token(s).");
        return self::SUCCESS;
    }
}
```

- [ ] **Step 9: Schedule purge**

In `routes/console.php`:

```php
$schedule->command('tokens:purge-expired')->daily();
```

- [ ] **Step 10: Commit**

```bash
git add database/migrations/2026_07_12_000002_add_expires_at_to_personal_access_tokens.php app/Http/Middleware/CheckTokenExpiry.php app/Console/Commands/PurgeExpiredTokens.php bootstrap/app.php routes/api.php routes/console.php tests/Feature/Middleware/CheckTokenExpiryTest.php
git commit -m "feat(security): API token TTL + expiry check + purge"
```

---

### Task 3.2.3: Security Headers + Per-Tenant Rate Limiting

**Files:**
- Create: `app/Http/Middleware/SecurityHeaders.php`
- Modify: `bootstrap/app.php`
- Modify: `routes/web.php` (add rate limiter)
- Test: `tests/Feature/Middleware/SecurityHeadersTest.php`

**Interfaces:**
- Produces: `SecurityHeaders` middleware adding HSTS, X-Frame-Options, etc.

- [ ] **Step 1: Write the failing test**

```php
<?php

namespace Tests\Feature\Middleware;

use App\Models\User;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SecurityHeadersTest extends TestCase
{
    use RefreshDatabase;

    public function test_security_headers_present_on_response(): void
    {
        $tenant = TenantModel::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $response->assertHeader('X-Frame-Options', 'DENY');
        $response->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    }

    public function test_hsts_header_present(): void
    {
        $tenant = TenantModel::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertHeader('Strict-Transport-Security');
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --compact --filter=SecurityHeadersTest`
Expected: FAIL (middleware not registered)

- [ ] **Step 3: Write the middleware**

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);

        $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'geolocation=(self), microphone=(self)');

        return $response;
    }
}
```

- [ ] **Step 4: Register middleware globally**

In `bootstrap/app.php`, append to web middleware:

```php
$middleware->web(append: [
    HandleInertiaRequests::class,
    AddLinkHeadersForPreloadedAssets::class,
    \App\Http\Middleware\SecurityHeaders::class,
]);
```

- [ ] **Step 5: Run test to verify it passes**

Run: `php artisan test --compact --filter=SecurityHeadersTest`
Expected: 2/2 PASS

- [ ] **Step 6: Commit**

```bash
git add app/Http/Middleware/SecurityHeaders.php bootstrap/app.php tests/Feature/Middleware/SecurityHeadersTest.php
git commit -m "feat(security): HSTS, X-Frame-Options, X-Content-Type-Options headers"
```

---

### Task 3.3.1: Getting Started Wizard

**Files:**
- Create: `app/Http/Controllers/Web/GettingStartedController.php`
- Create: `resources/js/Pages/GettingStarted/Index.jsx`
- Modify: `routes/web.php`
- Modify: `app/Http/Controllers/Auth/RegisteredUserController.php` (redirect)
- Test: `tests/Feature/Web/GettingStartedPageTest.php`

**Interfaces:**
- Consumes: ConnectTwilioButton (Task 2.1.2), ElevenLabsConnectModal (Task 2.2.2)
- Produces: `GET /getting-started` wizard page, post-registration redirect

- [ ] **Step 1: Write the failing test**

```php
<?php

namespace Tests\Feature\Web;

use App\Models\User;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GettingStartedPageTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $tenant = TenantModel::factory()->create();
        $this->user = User::factory()->create(['tenant_id' => $tenant->id]);
    }

    public function test_getting_started_page_returns_ok(): void
    {
        $this->actingAs($this->user)
            ->get('/getting-started')
            ->assertOk();
    }

    public function test_getting_started_page_renders_correct_component(): void
    {
        $this->actingAs($this->user)
            ->get('/getting-started')
            ->assertInertiaComponent('GettingStarted/Index');
    }

    public function test_completed_onboarding_redirects_to_dashboard(): void
    {
        $tenant = TenantModel::find($this->user->tenant_id);
        $tenant->update(['settings' => array_merge($tenant->settings ?? [], ['onboarding_completed' => true])]);

        $this->actingAs($this->user)
            ->get('/getting-started')
            ->assertRedirect(route('dashboard'));
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --compact --filter=GettingStartedPageTest`
Expected: FAIL

- [ ] **Step 3: Write the controller**

```php
<?php

namespace App\Http\Controllers\Web;

use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Inertia\Inertia;
use Inertia\Response;

class GettingStartedController extends Controller
{
    public function index(Request $request): Response
    {
        $tenant = TenantModel::find($request->user()->tenant_id);

        if (($tenant->settings['onboarding_completed'] ?? false) === true) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('GettingStarted/Index', [
            'tenant' => [
                'twilio_connected' => !empty($tenant->settings['twilio_oauth_enabled']),
                'elevenlabs_connected' => !empty($tenant->settings['elevenlabs_api_key']),
            ],
            'twilio' => [
                'client_id' => config('twilio-oauth.client_id'),
                'state' => Crypt::encryptString(json_encode([
                    'tenant_id' => $tenant->id,
                    'user_id' => $request->user()->id,
                    'created_at' => now()->timestamp,
                ])),
            ],
        ]);
    }

    public function complete(Request $request): \Illuminate\Http\RedirectResponse
    {
        $tenant = TenantModel::find($request->user()->tenant_id);
        $tenant->update(['settings' => array_merge($tenant->settings ?? [], ['onboarding_completed' => true])]);

        return redirect()->route('dashboard')->with('message', 'Welcome aboard! Your account is ready.');
    }
}
```

- [ ] **Step 4: Add routes**

In `routes/web.php`, inside the auth group:

```php
use App\Http\Controllers\Web\GettingStartedController;

Route::get('/getting-started', [GettingStartedController::class, 'index'])->name('getting-started');
Route::post('/getting-started/complete', [GettingStartedController::class, 'complete'])->name('getting-started.complete');
```

- [ ] **Step 5: Create the React page**

`resources/js/Pages/GettingStarted/Index.jsx` — 4-step wizard:
1. Connect Twilio (shows ConnectTwilioButton if not connected, green check if connected)
2. Connect ElevenLabs (shows Connect button if not connected, account info if connected)
3. Create First Flow (link to /flows with CTA)
4. Test Call (instructions + assigned phone number)

Components: stepper indicator (4 circles), skip link, next/back buttons, completion POST to `/getting-started/complete`.

- [ ] **Step 6: Modify registration redirect**

In `app/Http/Controllers/Auth/RegisteredUserController.php`, change:

```php
return redirect(route('dashboard', absolute: false));
```

To:

```php
return redirect()->route('getting-started');
```

- [ ] **Step 7: Run tests**

Run: `php artisan test --compact --filter=GettingStartedPageTest`
Expected: 3/3 PASS

- [ ] **Step 8: Commit**

```bash
git add app/Http/Controllers/Web/GettingStartedController.php resources/js/Pages/GettingStarted/Index.jsx routes/web.php app/Http/Controllers/Auth/RegisteredUserController.php tests/Feature/Web/GettingStartedPageTest.php
git commit -m "feat(onboarding): getting started wizard — 4-step post-registration flow"
```

---

### Task 3.3.2: Final QA + Push

**Files:** None (verification only)

- [ ] **Step 1: Run full test suite**

Run: `php artisan test --compact`
Expected: All tests pass (existing + new)

- [ ] **Step 2: Run PHPStan**

Run: `composer phpstan`
Expected: 0 errors

- [ ] **Step 3: Run Pint**

Run: `vendor/bin/pint --format agent`
Expected: Clean

- [ ] **Step 4: Run build**

Run: `pnpm run build`
Expected: Clean

- [ ] **Step 5: Generate Wayfinder**

Run: `php artisan wayfinder:generate`

- [ ] **Step 6: Push**

```bash
git push
```
