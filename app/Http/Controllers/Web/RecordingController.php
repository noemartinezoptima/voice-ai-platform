<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Call\CallModel;
use App\Services\RecordingEncryptionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class RecordingController extends Controller
{
    public function __invoke(Request $request, CallModel $call): StreamedResponse
    {
        if ($call->tenant_id !== $request->user()->tenant_id) {
            abort(404);
        }

        if ($call->recording_path === null || ! Storage::disk('recordings')->exists($call->recording_path)) {
            abort(404);
        }

        $service = RecordingEncryptionService::make();
        $stream = $service->decryptStream(Storage::disk('recordings')->path($call->recording_path));

        $stats = fstat($stream);
        $contentLength = $stats !== false ? (string) $stats['size'] : null;

        return response()->stream(function () use ($stream) {
            fpassthru($stream);
            fclose($stream);
        }, 200, array_filter([
            'Content-Type' => 'audio/wav',
            'Content-Length' => $contentLength,
        ]));
    }
}
