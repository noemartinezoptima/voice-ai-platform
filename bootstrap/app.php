<?php

use App\Http\Middleware\CheckTokenExpiry;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\IpAllowlist;
use App\Http\Middleware\SecurityHeaders;
use App\Http\Middleware\ValidateTwilioRequest;
use App\Infrastructure\Persistence\Eloquent\ErrorEventModel;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            SecurityHeaders::class,
        ]);

        $middleware->api(append: [
            SecurityHeaders::class,
        ]);

        $middleware->alias([
            'twilio.verify' => ValidateTwilioRequest::class,
            'token.expiry' => CheckTokenExpiry::class,
            'ip.allowlist' => IpAllowlist::class,
        ]);

        $middleware->validateCsrfTokens(except: [
            'twilio/*',
            'stripe/*',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );

        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->header('X-Inertia')) {
                return Inertia::location(route('login'));
            }

            return null;
        });

        $exceptions->reportable(function (Throwable $e) {
            if ($e instanceof HttpResponseException) {
                return;
            }

            if ($e instanceof ValidationException) {
                return;
            }

            ErrorEventModel::record($e);
        });
    })->create();
