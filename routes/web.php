<?php

use App\Http\Controllers\Api\DataDeletionController;
use App\Http\Controllers\Api\DataExportController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Twilio\SmsController as TwilioSmsController;
use App\Http\Controllers\Twilio\WebhookController;
use App\Http\Controllers\Web\AcceptInviteController;
use App\Http\Controllers\Web\ActivityLogController;
use App\Http\Controllers\Web\ApiTokenController;
use App\Http\Controllers\Web\BillingController;
use App\Http\Controllers\Web\CallController;
use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\DataProtectionController;
use App\Http\Controllers\Web\DocumentsController;
use App\Http\Controllers\Web\ElevenLabsAgentController;
use App\Http\Controllers\Web\ElevenLabsConnectController;
use App\Http\Controllers\Web\FlowController;
use App\Http\Controllers\Web\GettingStartedController;
use App\Http\Controllers\Web\MonitorController;
use App\Http\Controllers\Web\PrivacyController;
use App\Http\Controllers\Web\RecordingController;
use App\Http\Controllers\Web\RoleController;
use App\Http\Controllers\Web\SmsController;
use App\Http\Controllers\Web\SystemHealthController;
use App\Http\Controllers\Web\TeamMemberController;
use App\Http\Controllers\Web\TenantSettingsController;
use App\Http\Controllers\Web\TwilioOAuthController;
use App\Http\Controllers\Web\VoiceController;
use App\Http\Controllers\Web\VoiceSettingsController;
use App\Http\Controllers\Web\WebhookDestinationController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::post('twilio/inbound', [WebhookController::class, 'inbound'])->middleware('twilio.verify');
Route::post('twilio/step', [WebhookController::class, 'step'])->middleware('twilio.verify');
Route::post('twilio/status', [WebhookController::class, 'status'])->middleware('twilio.verify');
Route::post('twilio/gather', [WebhookController::class, 'gather'])->middleware('twilio.verify');
Route::post('twilio/recording', [WebhookController::class, 'recording'])->middleware('twilio.verify');
Route::post('twilio/consent-callback', [WebhookController::class, 'consentCallback'])
    ->middleware('twilio.verify')
    ->name('twilio.consent-callback');
Route::post('twilio/sms/inbound', [TwilioSmsController::class, 'inbound'])->middleware('throttle:twilio');

Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }

    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::get('/dashboard/export/csv', [DashboardController::class, 'exportAnalytics'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard.export.analytics');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/flows', [FlowController::class, 'index'])->name('flows.index');
    Route::get('/flows/create', [FlowController::class, 'create'])->name('flows.create');
    Route::post('/flows', [FlowController::class, 'store'])->name('flows.store');
    Route::get('/flows/{flow}/edit', [FlowController::class, 'edit'])->name('flows.edit');
    Route::get('/flows/{flow}', [FlowController::class, 'show'])->name('flows.show');
    Route::patch('/flows/{flow}', [FlowController::class, 'update'])->name('flows.update');
    Route::post('/flows/{flow}/test', [FlowController::class, 'test'])->name('flows.test');
    Route::post('/flows/{flow}/duplicate', [FlowController::class, 'duplicate'])->name('flows.duplicate');
    Route::get('/flows/{flow}/export', [FlowController::class, 'export'])->name('flows.export');
    Route::post('/flows/import', [FlowController::class, 'import'])->name('flows.import');
    Route::delete('/flows/{flow}', [FlowController::class, 'destroy'])->name('flows.destroy');

    Route::get('/calls', [CallController::class, 'index'])->name('calls.index');
    Route::get('/calls/export/csv', [CallController::class, 'exportCsv'])->name('calls.export');
    Route::get('/calls/{call}', [CallController::class, 'show'])->name('calls.show');
    Route::get('/recordings/{call}/play', [RecordingController::class, '__invoke'])->name('recordings.play');
    Route::patch('/calls/{call}/notes', [CallController::class, 'updateNotes'])->name('calls.notes');
    Route::post('/calls/{call}/retry', [CallController::class, 'retry'])->name('calls.retry');

    Route::get('/monitor', [MonitorController::class, 'index'])->name('monitor.index');
    Route::get('/monitor/active', [MonitorController::class, 'active'])->name('monitor.active');
    Route::get('/monitor/calls/{call}/transcript', [MonitorController::class, 'transcript'])->name('monitor.transcript');

    Route::get('/sms', [SmsController::class, 'index'])->name('sms.index');
    Route::post('/sms/send', [SmsController::class, 'send'])->name('sms.send');

    Route::get('/billing', [BillingController::class, 'index'])->name('billing.index');
    Route::patch('/billing/plan', [BillingController::class, 'updatePlan'])->name('billing.update');

    Route::get('/api-tokens', [ApiTokenController::class, 'index'])->name('api-tokens.index');
    Route::post('/api-tokens', [ApiTokenController::class, 'store'])->name('api-tokens.store');
    Route::delete('/api-tokens/{token}', [ApiTokenController::class, 'destroy'])->name('api-tokens.destroy');

    Route::get('/settings/tenant', [TenantSettingsController::class, 'edit'])->name('settings.tenant');
    Route::patch('/settings/tenant', [TenantSettingsController::class, 'update'])->name('settings.tenant.update');

    Route::get('/twilio/oauth/callback', [TwilioOAuthController::class, 'callback'])
        ->name('twilio.oauth.callback');
    Route::post('/twilio/oauth/disconnect', [TwilioOAuthController::class, 'disconnect'])
        ->name('twilio.oauth.disconnect');

    Route::get('/settings/voice', [VoiceSettingsController::class, 'edit'])->name('settings.voice');
    Route::patch('/settings/voice', [VoiceSettingsController::class, 'update'])->name('settings.voice.update');

    Route::get('/settings/voices', [VoiceController::class, 'index'])->name('settings.voices.index');
    Route::post('/settings/voices', [VoiceController::class, 'store'])->name('settings.voices.store');
    Route::delete('/settings/voices/{voice}', [VoiceController::class, 'destroy'])->name('settings.voices.destroy');
    Route::get('/settings/voices/{voice}', [VoiceController::class, 'show'])->name('settings.voices.show');
    Route::patch('/settings/voices/{voice}/default', [VoiceController::class, 'setDefault'])->name('settings.voices.set-default');

    Route::get('/settings/documents', [DocumentsController::class, 'index'])->name('settings.documents.index');
    Route::get('/settings/documents/create', [DocumentsController::class, 'create'])->name('settings.documents.create');
    Route::post('/settings/documents', [DocumentsController::class, 'store'])->name('settings.documents.store');
    Route::get('/settings/documents/{document}', [DocumentsController::class, 'show'])->name('settings.documents.show');
    Route::delete('/settings/documents/{document}', [DocumentsController::class, 'destroy'])->name('settings.documents.destroy');
    Route::post('/settings/documents/{document}/reprocess', [DocumentsController::class, 'reProcess'])->name('settings.documents.reprocess');
    Route::post('/settings/documents/upload', [DocumentsController::class, 'uploadFile'])->name('settings.documents.upload');

    Route::get('/settings/webhooks', [WebhookDestinationController::class, 'index'])->name('settings.webhooks.index');
    Route::post('/settings/webhooks', [WebhookDestinationController::class, 'store'])->name('settings.webhooks.store');
    Route::patch('/settings/webhooks/{webhook}', [WebhookDestinationController::class, 'update'])->name('settings.webhooks.update');
    Route::delete('/settings/webhooks/{webhook}', [WebhookDestinationController::class, 'destroy'])->name('settings.webhooks.destroy');

    Route::get('/settings/activity', [ActivityLogController::class, 'index'])->name('settings.activity.index');

    Route::post('/settings/elevenlabs/connect', [ElevenLabsConnectController::class, 'connect'])
        ->name('settings.elevenlabs.connect');
    Route::get('/settings/elevenlabs/status', [ElevenLabsConnectController::class, 'status'])
        ->name('settings.elevenlabs.status');

    Route::get('/settings/agents', [ElevenLabsAgentController::class, 'index'])->name('settings.agents.index');
    Route::post('/settings/agents', [ElevenLabsAgentController::class, 'store'])->name('settings.agents.store');
    Route::patch('/settings/agents/{agent}', [ElevenLabsAgentController::class, 'update'])->name('settings.agents.update');
    Route::delete('/settings/agents/{agent}', [ElevenLabsAgentController::class, 'destroy'])->name('settings.agents.destroy');
    Route::post('/settings/agents/sync', [ElevenLabsAgentController::class, 'syncFromApi'])->name('settings.agents.sync');

    Route::get('/team', [TeamMemberController::class, 'index'])->name('team.index');
    Route::post('/team/invite', [TeamMemberController::class, 'invite'])->name('team.invite');
    Route::patch('/team/{user}/role', [TeamMemberController::class, 'update'])->name('team.update');
    Route::delete('/team/{user}', [TeamMemberController::class, 'destroy'])->name('team.destroy');

    Route::get('/settings/data-protection', [DataProtectionController::class, 'edit'])
        ->name('settings.data-protection');
    Route::patch('/settings/data-protection', [DataProtectionController::class, 'update'])
        ->name('settings.data-protection.update');

    Route::get('/settings/privacy', [PrivacyController::class, 'index'])
        ->name('settings.privacy');

    Route::get('/settings/system', [SystemHealthController::class, 'index'])
        ->name('settings.system');

    Route::get('/settings/roles', [RoleController::class, 'index'])
        ->name('settings.roles');
    Route::patch('/settings/roles/{role}', [RoleController::class, 'update'])
        ->name('settings.roles.update');

    Route::get('/getting-started', [GettingStartedController::class, 'index'])
        ->name('getting-started');
    Route::post('/getting-started/completed', [GettingStartedController::class, 'complete'])
        ->name('getting-started.complete');

    Route::delete('/api/tenant/data', [DataDeletionController::class, 'destroy'])
        ->name('api.tenant.data.delete');
    Route::get('/api/tenant/data/export', [DataExportController::class, 'export'])
        ->name('api.tenant.data.export');
});

Route::get('/invite/{token}', AcceptInviteController::class)->name('invite.accept');

require __DIR__.'/auth.php';
