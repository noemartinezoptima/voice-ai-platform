<?php

namespace App\Http\Controllers\Web;

use App\Domain\Flow\ValueObjects\FlowConfig;
use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Flow\FlowModel;
use App\Services\FlowSimulator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FlowTestController extends Controller
{
    public function simulate(Request $request, string $flow): JsonResponse
    {
        $flowModel = FlowModel::where('id', $flow)
            ->where('tenant_id', $request->user()->tenant_id)
            ->firstOrFail();

        $config = FlowConfig::fromArray($flowModel->config);
        $simulator = new FlowSimulator;
        $results = $simulator->simulate($config);

        return response()->json([
            'flow_name' => $flowModel->name,
            'steps_count' => count($config->steps()),
            'results' => $results,
        ]);
    }
}
