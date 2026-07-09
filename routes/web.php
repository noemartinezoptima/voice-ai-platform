<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Twilio\SmsController as TwilioSmsController;
use App\Http\Controllers\Twilio\WebhookController;
use App\Http\Controllers\Web\AcceptInviteController;
use App\Http\Controllers\Web\ApiTokenController;
use App\Http\Controllers\Web\CallController;
use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\DocumentsController;
use App\Http\Controllers\Web\FlowController;
use App\Http\Controllers\Web\MonitorController;
use App\Http\Controllers\Web\SmsController;
use App\Http\Controllers\Web\TeamMemberController;
use App\Http\Controllers\Web\TenantSettingsController;
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

Route::middleware('auth')->group(function () {
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
    Route::patch('/calls/{call}/notes', [CallController::class, 'updateNotes'])->name('calls.notes');

    Route::get('/monitor', [MonitorController::class, 'index'])->name('monitor.index');
    Route::get('/monitor/active', [MonitorController::class, 'active'])->name('monitor.active');

    Route::get('/sms', [SmsController::class, 'index'])->name('sms.index');

    Route::get('/api-tokens', [ApiTokenController::class, 'index'])->name('api-tokens.index');
    Route::post('/api-tokens', [ApiTokenController::class, 'store'])->name('api-tokens.store');
    Route::delete('/api-tokens/{token}', [ApiTokenController::class, 'destroy'])->name('api-tokens.destroy');

    Route::get('/settings/tenant', [TenantSettingsController::class, 'edit'])->name('settings.tenant');
    Route::patch('/settings/tenant', [TenantSettingsController::class, 'update'])->name('settings.tenant.update');

    Route::get('/settings/voice', [VoiceSettingsController::class, 'edit'])->name('settings.voice');
    Route::patch('/settings/voice', [VoiceSettingsController::class, 'update'])->name('settings.voice.update');

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

    Route::get('/team', [TeamMemberController::class, 'index'])->name('team.index');
    Route::post('/team/invite', [TeamMemberController::class, 'invite'])->name('team.invite');
    Route::patch('/team/{user}/role', [TeamMemberController::class, 'update'])->name('team.update');
    Route::delete('/team/{user}', [TeamMemberController::class, 'destroy'])->name('team.destroy');
});

Route::get('/invite/{token}', AcceptInviteController::class)->name('invite.accept');

require __DIR__.'/auth.php';
