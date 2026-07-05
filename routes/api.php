<?php

use App\Http\Controllers\Api\CallController;
use App\Http\Controllers\Api\FlowController;
use App\Http\Controllers\Api\TenantController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->prefix('v1')->group(function () {
    Route::apiResource('flows', FlowController::class);
    Route::apiResource('calls', CallController::class)->only(['index', 'show']);
    Route::get('calls/{call}/transcript', [CallController::class, 'transcript']);
    Route::apiResource('tenants', TenantController::class);
});
