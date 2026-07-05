<?php

namespace App\Http\Controllers\Api;

use App\Domain\Call\Repositories\CallRepositoryInterface;
use App\Http\Controllers\Controller;
use App\Http\Resources\CallResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CallController extends Controller
{
    public function __construct(
        private readonly CallRepositoryInterface $callRepository,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;
        $calls = $this->callRepository->findByTenant($tenantId);

        return response()->json(CallResource::collection($calls));
    }

    public function show(string $id): JsonResponse
    {
        $call = $this->callRepository->findById($id);

        if (! $call) {
            return response()->json(['error' => 'Call not found'], 404);
        }

        return response()->json(new CallResource($call));
    }

    public function transcript(string $id): JsonResponse
    {
        $transcript = $this->callRepository->getTranscript($id);

        if ($transcript === null) {
            return response()->json(['error' => 'Call not found'], 404);
        }

        return response()->json(['transcript' => $transcript]);
    }
}
